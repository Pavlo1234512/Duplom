import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "НЕАВТОРИЗОВАНО" }, { status: 401 });

    const { rawText } = await req.json();
    if (!rawText) return NextResponse.json({ error: "ТЕКСТ ПОРОЖНІЙ" }, { status: 400 });

    await dbConnect();

    const findNum = (p: string) => {
      const m = rawText.match(new RegExp(`${p}\\s*[:\\-—]?\\s*(\\d+)`, 'i'));
      return m ? parseInt(m[1]) : 0;
    };

    const analyzedReport = {
      number: rawText.match(/(?:№|номер)\s*(\d+)/i)?.[1] || Math.floor(Date.now() / 100000),
      unit: rawText.match(/(\d+[- ]?(?:рота|батальйон|взвод))/i)?.[0]?.toUpperCase() || "ВІТІ",
      title: "AI АНАЛІЗ: " + rawText.substring(0, 40) + "...",
      content: rawText,
      losses200: findNum("200"),
      losses300: findNum("300"),
      losses500: findNum("500"),
      ammoLevel: rawText.match(/(?:бк|боєкомплект)\s*[:\-—]?\s*([\d.,]+)/i)?.[1] || "1.0",
      author: session.user?.name || "AI ANALYZER",
      authorId: (session.user as any).id,
      status: "normal"
    };

    const newReport = await Report.create(analyzedReport);
    return NextResponse.json({ success: true, id: newReport._id }, { status: 201 });

  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: "ПОМИЛКА ЗБЕРЕЖЕННЯ В БД" }, { status: 500 });
  }
}