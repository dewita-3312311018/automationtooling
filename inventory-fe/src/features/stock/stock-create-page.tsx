import { StockForm } from "./components";

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

export function StockCreatePage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="mx-auto max-w-4xl">
        <StockForm />
      </div>
    </div>
  );
}
