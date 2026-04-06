import mongoose, { Schema, model, models } from "mongoose";

const UnitSchema = new Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

const Unit = models.Unit || model("Unit", UnitSchema);
export default Unit;