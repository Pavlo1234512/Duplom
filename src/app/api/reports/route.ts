import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Неавторизовано" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Перевірка мінімально необхідних полів для створення запису
    if (!body.unit || !body.title || !body.content) {
      return NextResponse.json({ 
        error: "Відсутні обов'язкові поля: Підрозділ, Тема або Зміст" 
      }, { status: 400 });
    }

    const newReport = await Report.create({
      ...body,
      number: body.number || Math.floor(Date.now() / 100000),
      author: body.author || session.user?.name || "Оператор",
      authorId: (session.user as any).id,
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error: any) {
    console.error("DATABASE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const reports = await Report.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}