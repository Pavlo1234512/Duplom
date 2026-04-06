import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactor: { label: "2FA", type: "text" }
      },
      async authorize(credentials) {
        await dbConnect();

        const user = await User.findOne({ 
          login: credentials?.login?.trim() 
        }).select("+password");

        if (!user) {
          throw new Error("КОРИСТУВАЧА НЕ ЗНАЙДЕНО");
        }

        const currentStatus = user.status?.toLowerCase();
        if (currentStatus !== 'approved') {
          throw new Error(`ДОСТУП ОБМЕЖЕНО. СТАТУС: ${user.status.toUpperCase()}`);
        }

        const isMatch = await bcrypt.compare(credentials!.password, user.password);
        if (!isMatch) {
          throw new Error("НЕВІРНИЙ ПАРОЛЬ");
        }

        if (!/^\d{6}$/.test(credentials!.twoFactor || "")) {
          throw new Error("ВВЕДІТЬ 6 ЦИФР КОДУ 2FA");
        }

        return {
          id: user._id.toString(),
          login: user.login,
          name: `${user.lastName} ${user.firstName}`,
          role: user.role || 'USER',
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.login = (user as any).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).login = token.login;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { 
    signIn: "/auth/login" 
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };