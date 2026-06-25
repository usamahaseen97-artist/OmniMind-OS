/** Visionary Studio — AI Marketing Suite types (Phase 5). */

export type MarketingWorkspaceMode =
  | "campaigns"
  | "brand"
  | "product"
  | "creative"
  | "social"
  | "content-factory"
  | "calendar"
  | "publishing"
  | "analytics"
  | "marketplace"
  | "team";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "pinterest"
  | "snapchat"
  | "x"
  | "threads";

export type ContentFormat =
  | "image"
  | "video"
  | "reel"
  | "short"
  | "story"
  | "carousel"
  | "banner"
  | "poster"
  | "logo"
  | "thumbnail"
  | "flyer"
  | "brochure"
  | "business-card"
  | "email-graphic"
  | "website-graphic"
  | "presentation-slide"
  | "infographic";

export type CopyType =
  | "headline"
  | "description"
  | "caption"
  | "hook"
  | "script"
  | "sales-copy"
  | "landing-page"
  | "email"
  | "blog"
  | "product-description"
  | "seo";

export type AdPlatform = "meta" | "google" | "youtube" | "tiktok" | "display" | "banner";

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: string;
  budget: number;
  startDate: string;
  endDate: string | null;
  platforms: (SocialPlatform | AdPlatform)[];
  creativeIds: string[];
  audienceId: string | null;
};

export type BrandIdentity = {
  id: string;
  companyName: string;
  tagline: string;
  mission: string;
  values: string[];
  targetAudience: string;
  businessInfo: string;
};

export type BrandColor = {
  id: string;
  hex: string;
  role: "primary" | "secondary" | "accent" | "neutral" | "background";
  name: string;
};

export type BrandTypography = {
  id: string;
  family: string;
  weight: string;
  role: "heading" | "body" | "caption" | "display";
};

export type BrandLogo = {
  id: string;
  name: string;
  variant: "primary" | "secondary" | "icon" | "monochrome";
  url: string | null;
};

export type BrandGuidelinesDoc = {
  id: string;
  section: string;
  content: string;
  updatedAt: string;
};

export type ProductAsset = {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  variantIds: string[];
  imageIds: string[];
  category: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  label: string;
  color: string | null;
  size: string | null;
};

export type ProductStudioTool =
  | "photography"
  | "bg-removal"
  | "bg-generation"
  | "shadow"
  | "reflection"
  | "packaging"
  | "lifestyle"
  | "studio-lighting"
  | "viewer-360";

export type SocialPost = {
  id: string;
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
  cta: string | null;
  mediaIds: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledAt: string | null;
};

export type ContentItem = {
  id: string;
  format: ContentFormat;
  title: string;
  prompt: string;
  status: "draft" | "generating" | "ready" | "published";
  assetId: string | null;
  campaignId: string | null;
};

export type CopyDraft = {
  id: string;
  type: CopyType;
  title: string;
  body: string;
  tone: string;
  campaignId: string | null;
};

export type AdCreative = {
  id: string;
  platform: AdPlatform;
  headline: string;
  description: string;
  cta: string;
  variationLabel: string;
  abTestGroup: "A" | "B" | "control" | null;
  budgetShare: number;
};

export type AudienceSegment = {
  id: string;
  name: string;
  demographics: string;
  interests: string[];
  size: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "post" | "campaign" | "reminder" | "approval";
  platform: SocialPlatform | null;
  status: "planned" | "scheduled" | "published" | "pending-approval";
};

export type PublishJob = {
  id: string;
  postId: string;
  platform: SocialPlatform;
  status: "queued" | "publishing" | "published" | "failed";
  scheduledAt: string;
  progress: number;
};

export type AnalyticsMetric = "reach" | "engagement" | "ctr" | "conversion" | "roi";

export type AnalyticsSnapshot = {
  id: string;
  campaignId: string;
  metric: AnalyticsMetric;
  value: number;
  delta: number;
  period: string;
};

export type TeamRole = "owner" | "admin" | "editor" | "reviewer" | "viewer";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatarColor: string;
};

export type TeamComment = {
  id: string;
  assetId: string;
  authorId: string;
  body: string;
  createdAt: string;
  resolved: boolean;
};

export type ApprovalRequest = {
  id: string;
  itemId: string;
  itemType: "post" | "creative" | "campaign";
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  reviewerId: string | null;
};

export type VersionEntry = {
  id: string;
  label: string;
  authorId: string;
  timestamp: string;
};

export type MarketingPlugin = {
  id: string;
  name: string;
  category: "marketing" | "brand-template" | "social-template" | "automation";
  installed: boolean;
  version: string;
};

export type MarketplaceTemplate = {
  id: string;
  name: string;
  category: "template" | "asset" | "automation";
  platform: SocialPlatform | AdPlatform | "universal";
  premium: boolean;
};

export type PromptTemplate = {
  id: string;
  label: string;
  category: ContentFormat | CopyType;
  prompt: string;
  tags: string[];
};

export type MarketingProject = {
  id: string;
  name: string;
  campaigns: Campaign[];
  activeCampaignId: string | null;
  modifiedAt: string;
  version: number;
};
