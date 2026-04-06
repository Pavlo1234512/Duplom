import mongoose, { Schema, Document, Model, models } from 'mongoose';
import type { BattleReport as ZodReport } from '@/lib/schemas';

interface IBattleReport extends Document, Omit<ZodReport, '_id'> {
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSubSchema = new Schema({
  type: { type: String, required: true },
  quantity: { type: Number, min: 0, required: true },
  status: { type: String, default: 'активна' },
}, { _id: false });

const AmmoSpentSubSchema = new Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const BattleReportSchema = new Schema<IBattleReport>({
  header: {
    from_unit: { type: String, required: true },
    time_report: { type: Date, required: true },
    report_type: { type: String, default: 'ЗВІТ' },
  },
  location: {
    area_description: String,
    coordinates: { mgrs: String, lat: Number, lon: Number },
  },
  enemy_losses_inflicted: {
    personnel_killed: { type: Number, default: 0 },
    equipment: [EquipmentSubSchema]
  },
  own_losses: {
    personnel_killed: { type: Number, default: 0 },
    equipment: [EquipmentSubSchema]
  },
  ammo_spent: { type: [AmmoSpentSubSchema], default: [] },
  narrative_summary: String,
}, { timestamps: true, collection: 'battle_reports' });

const BattleReport: Model<IBattleReport> = models.BattleReport || mongoose.model('BattleReport', BattleReportSchema);
export default BattleReport;