import type { Invoice, InsuranceClaim } from "../types";

/** Billing architecture — invoices, insurance, multi-currency */
export class BillingService {
  private invoices = new Map<string, Invoice>();
  private claims = new Map<string, InsuranceClaim>();

  createInvoice(input: Omit<Invoice, "id" | "status" | "createdAt" | "subtotal" | "total"> & { items: Invoice["items"] }): Invoice {
    const subtotal = input.items.reduce((s, i) => s + i.amount, 0);
    const total = subtotal - input.discount + input.tax;
    const invoice: Invoice = {
      ...input,
      id: `inv-${Date.now()}`,
      subtotal,
      total,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  issue(invoiceId: string) {
    const inv = this.invoices.get(invoiceId);
    if (!inv) throw new Error("Invoice not found");
    inv.status = "issued";
    return inv;
  }

  recordPayment(invoiceId: string) {
    const inv = this.invoices.get(invoiceId);
    if (!inv) throw new Error("Invoice not found");
    inv.status = "paid";
    inv.paidAt = new Date().toISOString();
    return inv;
  }

  applyDiscount(invoiceId: string, discount: number) {
    const inv = this.invoices.get(invoiceId);
    if (!inv) throw new Error("Invoice not found");
    inv.discount = discount;
    inv.total = inv.subtotal - discount + inv.tax;
    return inv;
  }

  refund(invoiceId: string) {
    const inv = this.invoices.get(invoiceId);
    if (!inv) throw new Error("Invoice not found");
    inv.status = "refunded";
    return inv;
  }

  submitClaim(claim: Omit<InsuranceClaim, "id" | "status" | "submittedAt">) {
    const record: InsuranceClaim = {
      ...claim,
      id: `claim-${Date.now()}`,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    };
    this.claims.set(record.id, record);
    const inv = this.invoices.get(claim.invoiceId);
    if (inv) inv.insuranceClaimId = record.id;
    return record;
  }

  getInvoice(id: string) {
    return this.invoices.get(id);
  }

  listInvoices(patientId?: string) {
    const list = [...this.invoices.values()];
    return patientId ? list.filter((i) => i.patientId === patientId) : list;
  }
}

let service: BillingService | null = null;

export function getBillingService() {
  if (!service) service = new BillingService();
  return service;
}
