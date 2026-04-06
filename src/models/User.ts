import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  unit: { type: String, required: true },
  position: { type: String, required: true },
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  twoFactorSecret: { type: String, required: true, select: false },
  role: { type: String, default: "USER" },
  status: { type: String, default: "pending" },
  
  resetToken: { 
    type: String, 
    default: null 
  },
  resetTokenExpiry: { 
    type: Number, 
    default: null 
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);