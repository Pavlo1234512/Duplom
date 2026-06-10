import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. АБСОЛЮТНО ІГНОРУЄМО API (не чіпаємо токен, не зчитуємо нічого)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2. Для веб-сторінок вже перевіряємо токен
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (
    pathname.startsWith("/auth") || 
    pathname.includes("_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};