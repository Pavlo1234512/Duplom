# 🗄️ MongoDB Налаштування

## ✅ Статус

MongoDB успішно налаштовано та підключено!

### Дані про підключення:
- **Версія MongoDB:** 8.0.23
- **Статус:** ✅ Активне
- **Колекції:** 1 (battle_reports)

## 📋 Конфігурація

### Встановлені пакети:
- `mongoose` ^9.3.0 - ODM для MongoDB

### Файл конфігурації:
- **[src/lib/db.ts](src/lib/db.ts)** - функція підключення до БД

### Змінні середовища (.env.local):
```
MONGODB_URI=mongodb+srv://pavlo:1234567890@cluster0.tzysgnt.mongodb.net/stratcom_db?retryWrites=true&w=majority
```

## 📊 Моделі Mongoose

Налаштовані моделі:
1. **[User.ts](src/models/User.ts)** - Користувачі системи
2. **[Report.ts](src/models/Report.ts)** - Бойові донесення
3. **[BattleReport.ts](src/models/BattleReport.ts)**
4. **[Unit.ts](src/models/Unit.ts)**

## 🚀 Як використовувати

### Підключення до БД в API маршрутах:
```typescript
import dbConnect from '@/lib/db';
import Report from '@/models/Report';

export async function GET() {
  await dbConnect();
  const reports = await Report.find();
  return Response.json(reports);
}
```

### В Server Components:
```typescript
import dbConnect from '@/lib/db';
import Report from '@/models/Report';

export default async function Page() {
  await dbConnect();
  const reports = await Report.find();
  return <div>{/* ... */}</div>;
}
```

## ⚙️ Опції Підключення

Поточні налаштування:
- **TLS:** Увімкнено
- **Buffer Commands:** Вимкнено
- **Connect Timeout:** 10 сек
- **Retry Writes:** Увімкнено (в URL)

## ⚠️ Важливо

1. **Не публікуйте .env.local!** - Файл з паролем у git
2. **Регулярно робіть backup** - Цінні дані в БД
3. **Моніторте вразливості** - npm audit для перевірки

## 🔍 Тестування підключення

Запустіть для тестування:
```bash
npm run test:db
```

Або вручну:
```bash
node test-mongodb.js
```

---
MongoDB готова до використання! ✅
