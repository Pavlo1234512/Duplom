import mongoose, { Schema, model, models } from 'mongoose';

// Під-схема для втрат особового складу
// Зберігає дані, які AI знайшов безпосередньо в тексті донесення
const PersonnelLossSchema = new Schema({
  unit: { type: String, default: "Не вказано" }, 
  format_100: String,
  w300_1: { type: Number, default: 0 },
  w300_total: { type: Number, default: 0 },
  evacuated: { type: Number, default: 0 },
  not_evacuated: { type: Number, default: 0 },
  total_on_shield: { type: Number, default: 0 },
  w500: { type: Number, default: 0 },
  szch: { type: Number, default: 0 },
  total_losses: { type: Number, default: 0 },
  notes: String
}, { _id: false });

// Під-схема для втрат техніки
const EquipmentLossSchema = new Schema({
  unit: { type: String, default: "Не вказано" },
  destroyed: String,
  damaged: String
}, { _id: false });

// Головна схема звіту
const BattleReportSchema = new Schema({
  // Це поле ідентифікує ПІДРОЗДІЛ АВТОРА, який відправив звіт (з профілю користувача)
  reporting_unit: { type: String, default: "Не вказано" }, 
  
  enemy_actions: {
    date: { type: String, default: () => new Date().toLocaleDateString('uk-UA') },
    total_assaults: { type: Number, default: 0 },
    waves_count: { type: Number, default: 0 },
    description: { type: String, default: "" }
  },
  shelling: { 
    total_count: { type: Number, default: 0 }, 
    details: { type: String, default: "" } 
  },
  airstrike: { 
    count: { type: Number, default: 0 }, 
    details: { type: String, default: "" } 
  },
  
  // AI буде заповнювати ці масиви даними з тексту (наприклад, "3 аемб 77 оаембр")
  own_personnel_losses: [PersonnelLossSchema],
  own_equipment_losses: [EquipmentLossSchema],
  
  enemy_losses: {
    personnel: { 
      dead: { type: Number, default: 0 }, 
      wounded: { type: Number, default: 0 }, 
      captured: { type: Number, default: 0 } 
    },
    equipment: { 
      destroyed: { type: String, default: "" }, 
      damaged: { type: String, default: "" } 
    }
  },
  commander_notes: {
    planned_actions: String,
    logistics_needs: String,
    other_info: String
  },
  is_processed: { type: Boolean, default: true }
}, { 
  timestamps: true, 
  collection: 'battle_reports',
  strict: true 
});

const BattleReport = models.BattleReport || model('BattleReport', BattleReportSchema);

export default BattleReport;