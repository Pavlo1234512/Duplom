import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BattleReport from "@/models/BattleReport";

export async function GET() {
  try {
    await dbConnect();

    const groupedData = await BattleReport.aggregate([
      // 1. Фільтруємо документи: беремо тільки ті, де reporting_unit існує і не є порожнім
      {
        $match: {
          reporting_unit: { 
            $exists: true, 
            $nin: [null, "", "undefined"] 
          }
        }
      },
      
      // 2. Групуємо безпосередньо за кореневим полем reporting_unit
      {
        $group: {
          _id: "$reporting_unit", 
          count: { $sum: 1 }
        }
      },
      
      // 3. Сортуємо за назвою підрозділу (A-Z)
      { 
        $sort: { _id: 1 } 
      }
    ]);

    return NextResponse.json(groupedData || []);
    
  } catch (error) {
    console.error("Помилка при групуванні звітів:", error);
    return NextResponse.json(
      { error: "Помилка завантаження даних аналітики" }, 
      { status: 500 }
    );
  }
}