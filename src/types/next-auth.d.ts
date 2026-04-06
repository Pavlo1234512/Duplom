import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Розширюємо стандартну сесію, щоб вона бачила підрозділ, роль та інші дані
   */
  interface Session {
    user: {
      id: string;
      unit?: string;
      role?: string;
      login?: string;
      rank?: string;
      position?: string;
    } & DefaultSession["user"];
  }

  /**
   * Розширюємо об'єкт User, який ми повертаємо з функції authorize
   */
  interface User {
    id: string;
    unit?: string;
    role?: string;
    login?: string;
    rank?: string;
    position?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Розширюємо JWT токен, щоб він міг зберігати та передавати ці дані між сервером і клієнтом
   */
  interface JWT {
    id: string;
    unit?: string;
    role?: string;
    login?: string;
    rank?: string;
    position?: string;
  }
}