import type {
  AdPlatform,
  AnalyticsMetric,
  ContentFormat,
  CopyType,
  MarketingWorkspaceMode,
  ProductStudioTool,
  SocialPlatform,
  TeamRole,
} from "./types";

export const MARKETING_MODULES = new Set([
  "marketing-studio",
  "brand-studio",
  "product-studio",
  "social-media-studio",
]);

export const MODULE_DEFAULT_MODE: Record<string, MarketingWorkspaceMode> = {
  "marketing-studio": "campaigns",
  "brand-studio": "brand",
  "product-studio": "product",
  "social-media-studio": "social",
};

export const WORKSPACE_MODES: { id: MarketingWorkspaceMode; label: string }[] = [
  { id: "campaigns", label: "Campaigns" },
  { id: "brand", label: "Brand" },
  { id: "product", label: "Product" },
  { id: "creative", label: "Creative" },
  { id: "social", label: "Social" },
  { id: "content-factory", label: "Content Factory" },
  { id: "calendar", label: "Calendar" },
  { id: "publishing", label: "Publishing" },
  { id: "analytics", label: "Analytics" },
  { id: "marketplace", label: "Marketplace" },
  { id: "team", label: "Team" },
];

export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "pinterest", label: "Pinterest" },
  { id: "snapchat", label: "Snapchat" },
  { id: "x", label: "X" },
  { id: "threads", label: "Threads" },
];

export const CONTENT_FORMATS: { id: ContentFormat; label: string }[] = [
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "reel", label: "Reels" },
  { id: "short", label: "Shorts" },
  { id: "story", label: "Stories" },
  { id: "carousel", label: "Carousels" },
  { id: "banner", label: "Banners" },
  { id: "poster", label: "Posters" },
  { id: "logo", label: "Logos" },
  { id: "thumbnail", label: "Thumbnails" },
  { id: "flyer", label: "Flyers" },
  { id: "brochure", label: "Brochures" },
  { id: "business-card", label: "Business Cards" },
  { id: "email-graphic", label: "Email Graphics" },
  { id: "website-graphic", label: "Website Graphics" },
  { id: "presentation-slide", label: "Presentation Slides" },
  { id: "infographic", label: "Infographics" },
];

export const COPY_TYPES: { id: CopyType; label: string }[] = [
  { id: "headline", label: "Headlines" },
  { id: "description", label: "Descriptions" },
  { id: "caption", label: "Captions" },
  { id: "hook", label: "Hooks" },
  { id: "script", label: "Scripts" },
  { id: "sales-copy", label: "Sales Copy" },
  { id: "landing-page", label: "Landing Pages" },
  { id: "email", label: "Emails" },
  { id: "blog", label: "Blogs" },
  { id: "product-description", label: "Product Descriptions" },
  { id: "seo", label: "SEO Content" },
];

export const AD_PLATFORMS: { id: AdPlatform; label: string }[] = [
  { id: "meta", label: "Meta Ads" },
  { id: "google", label: "Google Ads" },
  { id: "youtube", label: "YouTube Ads" },
  { id: "tiktok", label: "TikTok Ads" },
  { id: "display", label: "Display Ads" },
  { id: "banner", label: "Banner Ads" },
];

export const PRODUCT_STUDIO_TOOLS: { id: ProductStudioTool; label: string }[] = [
  { id: "photography", label: "AI Product Photography" },
  { id: "bg-removal", label: "Background Removal" },
  { id: "bg-generation", label: "Background Generation" },
  { id: "shadow", label: "Shadow Generator" },
  { id: "reflection", label: "Reflection Generator" },
  { id: "packaging", label: "Packaging Mockups" },
  { id: "lifestyle", label: "Lifestyle Scenes" },
  { id: "studio-lighting", label: "Studio Lighting" },
  { id: "viewer-360", label: "360 Product Viewer" },
];

export const ANALYTICS_METRICS: { id: AnalyticsMetric; label: string }[] = [
  { id: "reach", label: "Reach" },
  { id: "engagement", label: "Engagement" },
  { id: "ctr", label: "CTR" },
  { id: "conversion", label: "Conversion" },
  { id: "roi", label: "ROI" },
];

export const TEAM_ROLES: { id: TeamRole; label: string }[] = [
  { id: "owner", label: "Owner" },
  { id: "admin", label: "Admin" },
  { id: "editor", label: "Editor" },
  { id: "reviewer", label: "Reviewer" },
  { id: "viewer", label: "Viewer" },
];

export const SEED_CAMPAIGNS = [
  {
    id: "camp-1",
    name: "Q2 Product Launch",
    status: "active" as const,
    objective: "Awareness + Conversion",
    budget: 15000,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    platforms: ["instagram", "meta", "google"] as const,
    creativeIds: ["cr-1", "cr-2"],
    audienceId: "aud-1",
  },
  {
    id: "camp-2",
    name: "Brand Awareness",
    status: "draft" as const,
    objective: "Reach",
    budget: 8000,
    startDate: "2026-05-01",
    endDate: null,
    platforms: ["linkedin", "youtube"] as const,
    creativeIds: [],
    audienceId: null,
  },
];

export const SEED_PROMPTS = [
  { id: "pt-1", label: "Product Hero Shot", category: "image" as const, prompt: "Premium product on marble surface, studio lighting", tags: ["product", "ecommerce"] },
  { id: "pt-2", label: "Social Hook", category: "hook" as const, prompt: "Attention-grabbing opening line for {{product}}", tags: ["social", "copy"] },
];
