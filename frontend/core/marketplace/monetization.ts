import type { PricingModel } from "./types";

export type MonetizationPlan = {
  model: PricingModel;
  priceUsd?: number;
  trialDays?: number;
  couponCode?: string;
  revenueSharePercent?: number;
  teamSeats?: number;
};

/** Monetization architecture — pricing models (no payment processor). */
export const MONETIZATION_MODELS: Record<PricingModel, { label: string; description: string }> = {
  free: { label: "Free", description: "No cost, community support" },
  paid: { label: "Paid", description: "One-time purchase" },
  subscription: { label: "Subscription", description: "Monthly or annual billing" },
  one_time: { label: "One-Time", description: "Single payment, perpetual license" },
  enterprise: { label: "Enterprise", description: "Org-wide license with SLA" },
  team: { label: "Team", description: "Per-seat team license" },
};

export function calculateRevenueShare(grossUsd: number, sharePercent = 15) {
  return { platform: grossUsd * (sharePercent / 100), developer: grossUsd * (1 - sharePercent / 100) };
}

export function applyCoupon(priceUsd: number, couponCode?: string) {
  if (!couponCode) return priceUsd;
  if (couponCode.toUpperCase() === "OMNIMIND20") return priceUsd * 0.8;
  if (couponCode.toUpperCase() === "TRIAL") return 0;
  return priceUsd;
}
