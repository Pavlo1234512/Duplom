import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";

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
        try {
          await dbConnect();
          
          // Явно просимо базу повернути всі потрібні поля
          const user = await User.findOne({ 
            login: credentials?.login?.trim().toLowerCase() 
          }).select("+password +twoFactorSecret unit firstName lastName middleName role login");

          if (!user) throw new Error("Користувача не знайдено");

          const isMatch = await bcrypt.compare(credentials!.password, user.password);
          if (!isMatch) throw new Error("Невірний пароль");

          const isTokenValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: credentials!.twoFactor,
            window: 1, 
          });

          if (!isTokenValid) throw new Error("Невірний код 2FA");

          // Скорочуємо ПІБ: Прізвище І. П.
          const f = user.firstName ? `${user.firstName.charAt(0)}.` : "";
          const m = user.middleName ? `${user.middleName.charAt(0)}.` : "";
          const shortName = `${user.lastName} ${f}${m}`.trim();

          // Повертаємо об'єкт для запису в JWT
          return {
            id: user._id.toString(),
            name: shortName, 
            unit: user.unit || "ВІТІ", // Значення з бази або дефолт
            role: user.role,
            login: user.login
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.unit = (user as any).unit;
        token.role = (user as any).role;
        token.login = (user as any).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name; // Тут буде скорочене ім'я
        (session.user as any).unit = token.unit; // Тут буде підрозділ
        (session.user as any).role = token.role;
        (session.user as any).login = token.login;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/login" }
};