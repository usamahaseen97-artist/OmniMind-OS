import type { MedicineStock, PrescriptionQueueItem } from "../types";

/** Pharmacy architecture — inventory, dispensing, prescriptions */
export class PharmacyService {
  private stock = new Map<string, MedicineStock>();
  private queue: PrescriptionQueueItem[] = [];
  private suppliers = new Map<string, { id: string; name: string }>();

  constructor() {
    this.seedStock();
  }

  private seedStock() {
    const items: MedicineStock[] = [
      { id: "med-1", name: "Amoxicillin 500mg", genericName: "Amoxicillin", sku: "AMX-500", quantity: 500, unit: "capsules", reorderLevel: 100, expiryDate: "2027-06-01" },
      { id: "med-2", name: "Metformin 850mg", genericName: "Metformin", sku: "MET-850", quantity: 300, unit: "tablets", reorderLevel: 80, expiryDate: "2026-12-01" },
      { id: "med-3", name: "Lisinopril 10mg", genericName: "Lisinopril", sku: "LIS-10", quantity: 200, unit: "tablets", reorderLevel: 50, expiryDate: "2027-03-15" },
    ];
    for (const m of items) this.stock.set(m.id, m);
  }

  getStock() {
    return [...this.stock.values()];
  }

  checkAvailability(medicationName: string) {
    const item = [...this.stock.values()].find((s) => s.name.toLowerCase().includes(medicationName.toLowerCase()));
    return { available: !!item && item.quantity > 0, stock: item };
  }

  enqueuePrescription(patientId: string, prescriptionId: string, medications: string[]) {
    const item: PrescriptionQueueItem = {
      id: `rxq-${Date.now()}`,
      patientId,
      prescriptionId,
      medications,
      status: "pending",
      queuedAt: new Date().toISOString(),
    };
    this.queue.push(item);
    return item;
  }

  dispense(queueId: string) {
    const item = this.queue.find((q) => q.id === queueId);
    if (!item) throw new Error("Queue item not found");
    item.status = "dispensed";
    return item;
  }

  getExpiringSoon(days = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return [...this.stock.values()].filter((s) => s.expiryDate && new Date(s.expiryDate) <= cutoff);
  }

  getQueue() {
    return [...this.queue];
  }

  registerSupplier(id: string, name: string) {
    this.suppliers.set(id, { id, name });
    return { id, name };
  }
}

let service: PharmacyService | null = null;

export function getPharmacyService() {
  if (!service) service = new PharmacyService();
  return service;
}
