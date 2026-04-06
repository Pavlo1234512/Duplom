import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Дозволяємо всі запити до сторінок авторизації та статичних файлів
  if (
    pathname.startsWith("/auth") || 
    pathname.startsWith("/api/auth") ||
    pathname.includes("_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Якщо токена немає і ми не на сторінці auth — жорсткий редирект на login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Матчер, який охоплює ВСЕ, крім вказаних винятків
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};