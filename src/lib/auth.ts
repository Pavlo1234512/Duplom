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
          
          const lookupLogin = credentials?.login?.trim().toLowerCase();

          // Явно просимо базу повернути всі потрібні поля
          const user = await User.findOne({ 
            login: lookupLogin 
          }).select("+password +twoFactorSecret unit firstName lastName middleName role login");

          if (!user) throw new Error("Невірна комбінація логіна або пароля");

          // Перевірка пароля
          const isMatch = await bcrypt.compare(credentials!.password, user.password);
          if (!isMatch) throw new Error("Невірна комбінація логіна або пароля");

          // ГНУЧКА ПЕРЕВІРКА 2FA: Перевіряємо тільки якщо у користувача активовано секрет в базі
          if (user.twoFactorSecret) {
            if (!/^\d{6}$/.test(credentials?.twoFactor || "")) {
              throw new Error("Код 2FA повинен складатися з 6 цифр");
            }

            const isTokenValid = speakeasy.totp.verify({
              secret: user.twoFactorSecret,
              encoding: "base32",
              token: credentials!.twoFactor,
              window: 1, 
            });

            if (!isTokenValid) throw new Error("Невірний або прострочений код 2FA");
            console.log("=== 2FA ПЕРЕВІРКУ ПРОЙДЕНО УСПІШНО ===");
          } else {
            console.log("=== 2FA ще не налаштовано для цього профілю, пропускаємо ===");
          }

          // Скорочуємо ПІБ: Прізвище І. П.
          const f = user.firstName ? `${user.firstName.charAt(0)}.` : "";
          const m = user.middleName ? `${user.middleName.charAt(0)}.` : "";
          const shortName = `${user.lastName || ''} ${f}${m}`.trim() || user.login;

          // Повертаємо об'єкт для запису в JWT
          return {
            id: user._id.toString(),
            name: shortName, 
            unit: user.unit || "ВІТІ", 
            role: user.role || "USER",
            login: user.login
          };
        } catch (error: any) {
          console.error("NextAuth authorize error caught:", error.message);
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
        (session.user as any).name = token.name; 
        (session.user as any).unit = token.unit; 
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