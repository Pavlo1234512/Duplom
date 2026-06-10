import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
Ти — військовий аналітик. Твоє завдання — перетворити текст донесення на валідний JSON.
ПЕРШОЧЕРГОВО КЕРУЙСЯ ЦИМ СЛОВНИКОМ ПОЛІВ:

ПРИКЛАД:
Вхід: "Втрати 1 роти: 2 300, 1 200. Техніка: -1 БМП."
Вихід: {"own_personnel_losses": [{"unit": "1 рота", "w300_total": 2, "total_on_shield": 1, "total_losses": 3}], "own_equipment_losses": [{"unit": "1 рота", "destroyed": "1 БМП", "damaged": ""}]}

СЛОВНИК ПОЛІВ:
- enemy_actions: { 
    date: "ДД.ММ.РРРР", total_assaults: "к-сть атак", waves_count: "к-сть хвиль", 
    description: "напрямок, сили, результат" 
  }
- shelling: { total_count: "к-сть прильотів", details: "калібри, інтенсивність" }
- airstrike: { count: "к-сть ударів", details: "тип авіації, тип боєприпасу, квадрат" }
- own_personnel_losses: (Масив)
    unit: "назва підрозділу", format_100: "бойовий статус", w300_1: "легкі 300", 
    w300_total: "всього 300", evacuated: "евакуйовані", not_evacuated: "не евакуйовані", 
    total_on_shield: "загиблі/200", w500: "відмовники", szch: "СЗЧ", total_losses: "загальна сума"
- own_equipment_losses: { unit: "назва", destroyed: "знищена", damaged: "пошкоджена" }
- enemy_losses: { personnel: { dead, wounded, captured }, equipment: { destroyed, damaged } }
- commander_notes: { planned_actions, logistics_needs, other_info }

СТРУКТУРА JSON (ДОТРИМУЙСЯ ЇЇ СУВОРО):
{
  "enemy_actions": { "date": "ДД.ММ.РРРР", "total_assaults": 0, "waves_count": 0, "description": "" },
  "shelling": { "total_count": 0, "details": "" },
  "airstrike": { "count": 0, "details": "" },
  "own_personnel_losses": [{"unit": "", "w300_total": 0, "total_on_shield": 0, "total_losses": 0}],
  "own_equipment_losses": [{"unit": "", "destroyed": "", "damaged": ""}],
  "enemy_losses": { "personnel": { "dead": 0, "wounded": 0 }, "equipment": { "destroyed": "", "damaged": "" } },
  "commander_notes": { "planned_actions": "", "logistics_needs": "", "other_info": "" }
}

КРИТИЧНІ ПРАВИЛА:
1. ТЕХНІКА: Якщо в тексті згадується знищення або пошкодження техніки (наприклад, "DJI Mavic", "танк", "БМП"), ти ПОВИНЕН внести це в масив 'own_equipment_losses', навіть якщо про це написано посеред опису обстрілу.
2. ВТРАТИ О/С: Якщо написано "Втрати о/с - відсутні", заповнюй масив 'own_personnel_losses' пустим об'єктом або з нулями, але НЕ ігноруй це поле.
3. ДАТА: Шукай дату у форматі ДД.ММ.РРРР. Якщо її немає — не вигадуй, став сьогоднішню (02.06.2026).
4. Якщо даних немає — став 0 (для чисел) або пустий рядок (для тексту).
5. АРТИЛЕРІЯ (shelling):
- Якщо в тексті є згадка "Артилерійський обстріл" або подібне, 
  аЛЕ НЕМАЄ цифри кількості снарядів - став total_count: 1 (як позначення факту події).
- Якщо цифра є (напр. "30 прильотів") - став цю цифру.
- В поле "details" записуй повний опис (наприклад: "Артилерійський обстріл ППР БЛОК" не вписуй сюди що було знищено під час обстрілу).
6. Завжди розкладай втрати по підрозділах (масиви).
7. Повертай ТІЛЬКИ чистий JSON.
`;

export async function parseMilitaryReport(text: string) {
  try {
    console.log("ПАРСЕР: Отримав текст:", text.substring(0, 50) + "..."); // Дивіться в термінал!

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0].message.content || "{}";
    console.log("ПАРСЕР: ШІ повернув:", rawContent); // ДИВІТЬСЯ В ТЕРМІНАЛ!
    
    return JSON.parse(rawContent);
  } catch (error) {
    console.error("ПАРСЕР: Помилка:", error);
    return null;
  }
}