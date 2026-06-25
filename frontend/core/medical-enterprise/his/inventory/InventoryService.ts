import type { InventoryItem, HospitalId } from "../types";

/** Medical inventory — equipment, consumables, assets */
export class InventoryService {
  private items = new Map<string, InventoryItem>();

  constructor() {
    this.seed();
  }

  private seed() {
    const defaults: Omit<InventoryItem, "id">[] = [
      { hospitalId: "hospital-default", category: "equipment", name: "Ventilator", sku: "EQ-VENT-01", quantity: 8, location: "ICU", assetTag: "AST-001" },
      { hospitalId: "hospital-default", category: "consumable", name: "Surgical Gloves (M)", sku: "CON-GLV-M", quantity: 5000, location: "OR Storage" },
      { hospitalId: "hospital-default", category: "surgical", name: "Scalpel Set", sku: "SUR-SCL-01", quantity: 24, location: "OR" },
      { hospitalId: "hospital-default", category: "lab-supply", name: "Blood Collection Tubes", sku: "LAB-TUBE", quantity: 2000, location: "Lab" },
    ];
    for (const d of defaults) {
      const item: InventoryItem = { ...d, id: `inv-${d.sku}` };
      this.items.set(item.id, item);
    }
  }

  list(hospitalId?: HospitalId, category?: InventoryItem["category"]) {
    let list = [...this.items.values()];
    if (hospitalId) list = list.filter((i) => i.hospitalId === hospitalId);
    if (category) list = list.filter((i) => i.category === category);
    return list;
  }

  register(item: InventoryItem) {
    this.items.set(item.id, item);
    return item;
  }

  adjustQuantity(id: string, delta: number) {
    const item = this.items.get(id);
    if (!item) throw new Error("Item not found");
    item.quantity = Math.max(0, item.quantity + delta);
    return item;
  }

  getMaintenanceDue(withinDays = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return [...this.items.values()].filter((i) => i.maintenanceDue && new Date(i.maintenanceDue) <= cutoff);
  }
}

let service: InventoryService | null = null;

export function getInventoryService() {
  if (!service) service = new InventoryService();
  return service;
}
