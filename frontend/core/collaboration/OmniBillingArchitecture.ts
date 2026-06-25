import type { BillingPlan } from "./types";

/** OmniBillingArchitecture — seats, storage quotas, license management. */
export class OmniBillingArchitecture {
  plans: BillingPlan[] = [
    {
      orgId: "org-1",
      plan: "enterprise",
      seats: 50,
      storageQuotaBytes: 1_099_511_627_776,
      usedStorageBytes: 2_400_000_000,
      renewalAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  get(orgId: string) {
    return this.plans.find((p) => p.orgId === orgId) ?? null;
  }

  usage(orgId: string) {
    const plan = this.get(orgId);
    if (!plan) return null;
    return {
      seatsUsed: plan.seats,
      storagePercent: Math.round((plan.usedStorageBytes / plan.storageQuotaBytes) * 10000) / 100,
      storageUsedGb: Math.round((plan.usedStorageBytes / 1_073_741_824) * 100) / 100,
      storageQuotaGb: Math.round((plan.storageQuotaBytes / 1_073_741_824) * 100) / 100,
      renewalAt: plan.renewalAt,
      plan: plan.plan,
    };
  }

  updateSeats(orgId: string, seats: number) {
    const plan = this.get(orgId);
    if (!plan) return null;
    plan.seats = seats;
    return plan;
  }

  recordStorage(orgId: string, bytes: number) {
    const plan = this.get(orgId);
    if (!plan) return null;
    plan.usedStorageBytes = bytes;
    return plan;
  }
}

export const omniBillingArchitecture = new OmniBillingArchitecture();
