import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Функція ручної перевірки коду Google Authenticator (TOTP) за алгоритмом RFC 6238
function verifyTOTP(token: string, secret: string): boolean {
  try {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    for (let i = 0; i < secret.length; i++) {
      const val = base32chars.indexOf(secret.charAt(i).toUpperCase());
      if (val !== -1) bits += val.toString(2).padStart(5, "0");
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    const keyBuffer = Buffer.from(bytes);

    const counter = Math.floor(Date.now() / 30000);

    for (let delay = -1; delay <= 1; delay++) {
      const timeBuffer = Buffer.alloc(8);
      let tmpCounter = counter + delay;
      for (let i = 7; i >= 0; i--) {
        timeBuffer[i] = tmpCounter & 0xff;
        tmpCounter = tmpCounter >> 8;
      }

      const hmac = crypto.createHmac("sha1", keyBuffer);
      hmac.update(timeBuffer);
      const hmacResult = hmac.digest();

      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const code =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);

      const calculatedToken = (code % 1000000).toString().padStart(6, "0");
      if (calculatedToken === token) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error("Помилка валідації TOTP:", e);
    return false;
  }
}

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
          
          if (!lookupLogin || !credentials?.password) {
            throw new Error("Вкажіть логін та пароль");
          }

          // Шукаємо юзера в базі та витягуємо додаткові поля для профілю
          const user = await User.findOne({ 
            login: lookupLogin
          }).select("+password +twoFactorSecret status unit firstName lastName middleName role login");

          console.debug("NextAuth authorize: lookupLogin =", lookupLogin);

          // 1. Перевірка наявності користувача
          if (!user) {
            console.error("NextAuth authorize: user not found", credentials?.login);
            throw new Error("Невірна комбінація логіна або пароля");
          }

          // 2. Перевірка пароля
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (!isMatch) {
            console.error("NextAuth authorize: invalid password for", credentials?.login);
            throw new Error("Невірна комбінація логіна або пароля");
          }

          // 3. Перевірка 2FA (Тільки якщо секрет активований в базі)
          if (user.twoFactorSecret) {
            if (!/^\d{6}$/.test(credentials?.twoFactor || "")) {
              console.error("NextAuth authorize: invalid 2FA format", credentials?.twoFactor);
              throw new Error("Код 2FA повинен складатися з 6 цифр");
            }

            const is2FAValid = verifyTOTP(credentials.twoFactor, user.twoFactorSecret);

            if (!is2FAValid) {
              console.error("NextAuth authorize: 2FA token mismatch for", credentials?.login);
              throw new Error("Невірний або прострочений код 2FA");
            }
            console.log("=== 2FA ПЕРЕВІРКУ ПРОЙДЕНО УСПІШНО ===");
          } else {
            console.log("=== 2FA не налаштовано для юзера, пропускаємо в кабінет ===");
          }

          // Форматуємо скорочене ім'я для відображення в шапці (Прізвище І. П.)
          const f = user.firstName ? `${user.firstName.charAt(0)}.` : "";
          const m = user.middleName ? `${user.middleName.charAt(0)}.` : "";
          const shortName = `${user.lastName || ''} ${f}${m}`.trim() || user.login;

          // ПОВЕРТАЄМО ПОВНИЙ ОБ'ЄКТ (Додано unit та login)
          return {
            id: user._id.toString(),
            login: user.login,
            name: shortName,
            role: user.role || 'USER',
            unit: user.unit || 'ВІТІ'
          };
        } catch (error: any) {
          console.error("NextAuth authorize error caught:", error?.message);
          throw new Error(error?.message || "Сталася непередбачувана системна помилка");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.login = (user as any).login;
        token.name = user.name;
        token.role = (user as any).role;
        token.unit = (user as any).unit; // Записуємо підрозділ в токен
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).login = token.login;
        (session.user as any).name = token.name; // Тепер ім'я не буде злітати в undefined
        (session.user as any).role = token.role;
        (session.user as any).unit = token.unit; // Передаємо підрозділ у сесію фронтенду
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