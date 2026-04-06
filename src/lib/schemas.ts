import { z } from "zod";

export const EquipmentItemSchema = z.object({
  type: z.string().min(1, "Тип техніки обов'язковий"),
  quantity: z.number().int().min(0),
  status: z.enum([
    "знищено", 
    "пошкоджено", 
    "захоплено", 
    "рухається", 
    "активна", 
    "нейтральна", 
    "евакуйовано", 
    "ремонт"
  ]).default("активна"),
});

export const LossessSchema = z.object({
  personnel_killed: z.number().min(0).default(0),
  personnel_wounded: z.number().min(0).default(0),
  personnel_missing: z.number().min(0).default(0),
  equipment: z.array(EquipmentItemSchema).default([]),
});

export const CoordinateSchema = z.object({
  mgrs: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
}).refine((data) => data.mgrs || (data.lat && data.lon), {
  message: "Вкажіть або MGRS, або широту + довготу",
});

export const ReportHeaderSchema = z.object({
  from_unit: z.string().min(1, "Вкажіть підрозділ"),
  report_type: z.string().default("ЗВІТ"),
  time_report: z.string().or(z.date()),
});

export const BattleReportSchema = z.object({
  header: ReportHeaderSchema,
  location: z.object({
    area_description: z.string(),
    coordinates: CoordinateSchema.optional(),
  }),
  enemy_losses_inflicted: LossessSchema,
  own_losses: LossessSchema,
  ammo_spent: z.array(z.object({
    type: z.string(),
    amount: z.number(),
  })).default([]),
  narrative_summary: z.string().optional(),
});

export type BattleReport = z.infer<typeof BattleReportSchema>;