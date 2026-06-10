import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import BattleReport from "@/models/BattleReport";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { unit, date } = await req.json();
    await dbConnect();

    const [dateFromStr, dateToStr] = date.split('_');
    const reports = await BattleReport.find({
      reporting_unit: unit,
      createdAt: { $gte: new Date(dateFromStr), $lte: new Date(dateToStr + 'T23:59:59') }
    });

    let totalAssaults = 0;
    let totalShelling = 0;
    let enemyActions: string[] = [];
    const totals = { f100: 0, w300: 0, evac: 0, notEvac: 0, shield: 0, w500: 0, szch: 0, total: 0, destroyed: 0, damaged: 0 };

    reports.forEach((r: any) => {
      totalAssaults += r.enemy_actions?.total_assaults || 0;
      if (r.enemy_actions?.description) enemyActions.push(r.enemy_actions.description);
      totalShelling += r.shelling?.total_count || 0;
      r.own_personnel_losses?.forEach((p: any) => {
        totals.f100 += Number(p.format_100) || 0;
        totals.w300 += Number(p.w300_total) || 0;
        totals.evac += Number(p.evacuated) || 0;
        totals.notEvac += Number(p.not_evacuated) || 0;
        totals.shield += Number(p.total_on_shield) || 0;
        totals.w500 += Number(p.w500) || 0;
        totals.szch += Number(p.szch) || 0;
        totals.total += Number(p.total_losses) || 0;
      });
      r.own_equipment_losses?.forEach((eq: any) => {
        totals.destroyed += Number(eq.destroyed) || 0;
        totals.damaged += Number(eq.damaged) || 0;
      });
    });

    const doc = new Document({
      sections: [{
        children: [
          
          new Paragraph({ text: "\n\n" }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ЗВІТ", bold: true, size: 24 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `щодо обстановки в смузі відповідальності ${unit}`, bold: true, size: 24 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `станом на ${new Date().toLocaleDateString('uk-UA')}`, bold: true, size: 24 })] }),
          new Paragraph({ text: "\n" }),

          new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: "Дії противника", bold: true, size: 24 })] }),
          new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: `Противник протягом звітного періоду провів ${totalAssaults} штурмових дій. ${enemyActions.join(' ')}`, size: 24 })] }),
          new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: `Зафіксовано ${totalShelling} обстрілів.`, size: 24 })] }),
        ...reports.filter(r => r.shelling?.details).map(r => new Paragraph({ 
            children: [new TextRun({ text: r.shelling.details, size: 24 })] 
          })),
           
          
          
  
          new Paragraph({ text: "\n" }),
          new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: "Втрати особового складу", bold: true, size: 24 })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: ["Підрозділ", "Ф-100", "300", "Евак", "Не евак", "На щиті", "500", "СЗЧ", "Всього", "Примітки"].map(h => new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 24 })] })] })) }),
              ...reports.flatMap((r: any, index: number) => r.own_personnel_losses.map((p: any) => new TableRow({ 
                children: [
                  index === 0 ? new TableCell({ rowSpan: reports.flatMap(r => r.own_personnel_losses).length + 1, verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: unit, size: 24 })] })] }) : null,
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.format_100 || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.w300_total || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.evacuated || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.not_evacuated || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.total_on_shield || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.w500 || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.szch || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.total_losses || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.notes || ""), size: 24 })] })] })
                ].filter(Boolean) as TableCell[] 
              }))),
            ]
          }),

          new Paragraph({ text: "\n" }),
          new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: "Попередні втрати ОВТ за звітний період:", bold: true, size: 24 })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: ["Підрозділ", "Знищено", "Пошкоджено"].map(h => new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 24 })] })] })) }),
              ...reports.flatMap((r: any, index: number) => (r.own_equipment_losses || []).map((eq: any) => new TableRow({
                children: [
                  index === 0 ? new TableCell({ rowSpan: reports.flatMap(r => r.own_equipment_losses).length, verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: unit, size: 24 })] })] }) : null,
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(eq.destroyed || ""), size: 24 })] })] }),
                  new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(eq.damaged || ""), size: 24 })] })] })
                ].filter(Boolean) as TableCell[]
              })))
            ]
          }),

          new Paragraph({ text: "\n" }),
          new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: "Втрати противника", bold: true, size: 24 })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: ["Безповоротні", "Санітарні", "Полон", "Знищено", "Пошкоджено"].map(h => new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, size: 24 })] })] })) }),
              ...reports.map((r: any) => new TableRow({ children: [
                new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(r.enemy_losses?.personnel?.dead ), size: 24 })] })] }),
                new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(r.enemy_losses?.personnel?.wounded ), size: 24 })] })] }),
                new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(r.enemy_losses?.personnel?.captured ), size: 24 })] })] }),
                new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(r.enemy_losses?.equipment?.destroyed ), size: 24 })] })] }),
                new TableCell({ verticalAlign: AlignmentType.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(r.enemy_losses?.equipment?.damaged), size: 24 })] })] })
              ]}))
            ]
          }),

          new Paragraph({ text: "\n" }),
          new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: "СПЛАНОВАНІ ЗАХОДИ", bold: true,  size: 24 })] }),
          ...["Виставлення позицій", "Переміщення позицій", "Ротація", "Встановлення МВЗ/НВЗ", "Вогневе ураження", "Інші заходи", "Відповідальний на ніч"].map(text => new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: `${text} (заповнюється командиром)`, size: 24 })] })),

          new Paragraph({ text: "\n\n" }),
          new Paragraph({ indent: { firstLine: 720 }, children: [new TextRun({ text: "Командир підрозділу ____________________ /____________________/", bold: true, size: 24 })] })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Combat_Report_${Date.now()}.docx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Помилка сервера" }, { status: 500 });
  }
}