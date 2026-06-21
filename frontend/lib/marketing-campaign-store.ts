"use client";

import { useSyncExternalStore } from "react";

export type MarketingCampaignPayload = {
  image_ad_url: string;
  video_ad_url: string;
  social_caption: string;
};

type MarketingCampaignState = {
  loading: boolean;
  imageAdUrl: string | null;
  videoAdUrl: string | null;
  socialCaption: string;
  lastPrompt: string;
};

let state: MarketingCampaignState = {
  loading: false,
  imageAdUrl: null,
  videoAdUrl: null,
  socialCaption: "",
  lastPrompt: "",
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeMarketingCampaign(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMarketingCampaignSnapshot(): MarketingCampaignState {
  return state;
}

export function useMarketingCampaign() {
  return useSyncExternalStore(
    subscribeMarketingCampaign,
    getMarketingCampaignSnapshot,
    getMarketingCampaignSnapshot,
  );
}

export function setMarketingCampaignLoading(loading: boolean) {
  state = { ...state, loading };
  emit();
}

export function applyMarketingCampaign(prompt: string, payload: MarketingCampaignPayload) {
  state = {
    loading: false,
    imageAdUrl: payload.image_ad_url,
    videoAdUrl: payload.video_ad_url,
    socialCaption: payload.social_caption,
    lastPrompt: prompt,
  };
  emit();
}

export function resetMarketingCampaign() {
  state = {
    loading: false,
    imageAdUrl: null,
    videoAdUrl: null,
    socialCaption: "",
    lastPrompt: "",
  };
  emit();
}
