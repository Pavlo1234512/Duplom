import mongoose, { Schema, model, models } from "mongoose";

const ReportSchema = new Schema({
  // 1. Загальна інформація (Header)
  number: { type: Number },
  unit: { type: String, required: true },
  location: { type: String },
  mapInfo: { type: String },

  // 2. Обстановка з противником (Enemy State)
  enemyAction: { type: String },
  enemyDirection: { type: String },
  enemyWeapons: { type: String },
  enemyLosses: { type: String },

  // 3. Стан свого підрозділу (Own Forces)
  title: { type: String, required: true }, // Тема донесення
  content: { type: String, required: true }, // Детальний зміст
  currentTask: { type: String },
  currentLine: { type: String },
  losses200: { type: Number, default: 0 },
  losses300: { type: Number, default: 0 },
  losses500: { type: Number, default: 0 },
  techLosses: { type: String },

  // 4. Забезпеченість (Logistics)
  ammoLevel: { type: String },
  fuelLevel: { type: String },
  supplies: { type: String },

  // 5. Рішення та запити
  nextSteps: { type: String },
  supportRequests: { type: String },

  // Системні поля
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  status: { type: String, default: "normal" }
}, { 
  timestamps: true,
  collection: 'battle_reports' 
});

const Report = models.Report || model("Report", ReportSchema);
export default Report;