export const UNITS_OF_MEASUREMENT = {
  pcs: "Pieces (PCS)",
  set: "Set",
  unit: "Unit",
  roll: "Roll",
  kg: "Kilogram (kg)",
  g: "Gram (g)",
  m: "Meter (m)",
  box: "Box",
  pack: "Pack",
  pail: "Pail",
  can: "Can",
} as const;

export type UnitOfMeasurement = keyof typeof UNITS_OF_MEASUREMENT;
