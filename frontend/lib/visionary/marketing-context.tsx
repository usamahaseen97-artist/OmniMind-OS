"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  analyticsEngine,
  brandStudioEngine,
  campaignManagerEngine,
  contentFactoryEngine,
  marketingPluginEngine,
  productStudioEngine,
  publishingEngine,
  schedulingEngine,
  teamWorkspaceEngine,
  visionaryMarketingApi,
  SEED_CAMPAIGNS,
  SEED_PROMPTS,
  MODULE_DEFAULT_MODE,
} from "./marketing";
import type {
  AdCreative,
  AdPlatform,
  AnalyticsSnapshot,
  ApprovalRequest,
  BrandColor,
  BrandGuidelinesDoc,
  BrandIdentity,
  BrandLogo,
  BrandTypography,
  CalendarEvent,
  Campaign,
  ContentFormat,
  ContentItem,
  CopyDraft,
  CopyType,
  MarketingPlugin,
  MarketingProject,
  MarketingWorkspaceMode,
  MarketplaceTemplate,
  ProductAsset,
  ProductStudioTool,
  ProductVariant,
  PromptTemplate,
  PublishJob,
  SocialPlatform,
  SocialPost,
  TeamComment,
  TeamMember,
  VersionEntry,
} from "./marketing/types";
import { useVisionaryStudio } from "./context";

function buildSeedProject(): MarketingProject {
  return {
    id: "mkt-proj-001",
    name: "OmniMind Marketing HQ",
    campaigns: SEED_CAMPAIGNS.map((c) => ({
      ...c,
      platforms: [...c.platforms],
      creativeIds: [...c.creativeIds],
    })),
    activeCampaignId: "camp-1",
    modifiedAt: new Date().toISOString(),
    version: 1,
  };
}

export type VisionaryMarketingContextValue = {
  project: MarketingProject;
  workspaceMode: MarketingWorkspaceMode;
  setWorkspaceMode: (m: MarketingWorkspaceMode) => void;
  activeCampaign: Campaign | null;
  setActiveCampaignId: (id: string) => void;
  addCampaign: (name: string, objective: string) => void;
  updateCampaignStatus: (id: string, status: Campaign["status"]) => void;
  brandIdentity: BrandIdentity;
  updateBrandIdentity: (patch: Partial<BrandIdentity>) => void;
  brandColors: BrandColor[];
  addBrandColor: (hex: string, role: BrandColor["role"]) => void;
  brandLogos: BrandLogo[];
  addBrandLogo: (name: string, variant: BrandLogo["variant"]) => void;
  brandFonts: BrandTypography[];
  addBrandFont: (family: string, role: BrandTypography["role"]) => void;
  brandGuidelines: BrandGuidelinesDoc[];
  products: ProductAsset[];
  addProduct: (name: string, sku: string) => void;
  productVariants: ProductVariant[];
  activeProductTool: ProductStudioTool | null;
  setActiveProductTool: (t: ProductStudioTool | null) => void;
  applyProductTool: (tool: ProductStudioTool) => void;
  socialPosts: SocialPost[];
  schedulePost: (platform: SocialPlatform, caption: string, at: string) => void;
  contentItems: ContentItem[];
  generateContent: (format: ContentFormat, title: string, prompt: string) => void;
  copyDrafts: CopyDraft[];
  generateCopy: (type: CopyType, title: string) => void;
  adCreatives: AdCreative[];
  addAdCreative: (platform: AdPlatform) => void;
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (title: string, date: string) => void;
  publishJobs: PublishJob[];
  queuePublish: (postId: string, platform: SocialPlatform) => void;
  analyticsSnapshots: AnalyticsSnapshot[];
  analyticsSummary: Record<string, number>;
  teamMembers: TeamMember[];
  addTeamMember: (name: string, email: string, role: TeamMember["role"]) => void;
  teamComments: TeamComment[];
  addComment: (assetId: string, body: string) => void;
  approvalRequests: ApprovalRequest[];
  requestApproval: (itemId: string, itemType: ApprovalRequest["itemType"]) => void;
  versionHistory: VersionEntry[];
  saveVersion: (label: string) => void;
  plugins: MarketingPlugin[];
  installPlugin: (id: string) => void;
  marketplaceTemplates: MarketplaceTemplate[];
  promptLibrary: PromptTemplate[];
  saveProject: () => void;
};

const VisionaryMarketingContext = createContext<VisionaryMarketingContextValue | null>(null);

export function VisionaryMarketingProvider({ children }: { children: ReactNode }) {
  const { activeModule } = useVisionaryStudio();
  const [project, setProject] = useState<MarketingProject>(buildSeedProject);
  const [workspaceMode, setWorkspaceMode] = useState<MarketingWorkspaceMode>("campaigns");

  useEffect(() => {
    const mode = MODULE_DEFAULT_MODE[activeModule];
    if (mode) setWorkspaceMode(mode);
  }, [activeModule]);

  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity>({
    id: "brand-1",
    companyName: "OmniMind",
    tagline: "Creative Intelligence for Enterprise",
    mission: "Unify creative and marketing workflows in one sovereign OS.",
    values: ["Innovation", "Quality", "Speed"],
    targetAudience: "Enterprise creative teams, agencies, and brand marketers",
    businessInfo: "Global · B2B SaaS · Creative Technology",
  });
  const [brandColors, setBrandColors] = useState<BrandColor[]>([
    { id: "c1", hex: "#c084fc", role: "primary", name: "Omni Violet" },
    { id: "c2", hex: "#38bdf8", role: "secondary", name: "Sky Blue" },
    { id: "c3", hex: "#0B0F19", role: "background", name: "Deep Space" },
  ]);
  const [brandLogos, setBrandLogos] = useState<BrandLogo[]>([
    { id: "l1", name: "Primary Logo", variant: "primary", url: null },
    { id: "l2", name: "Icon Mark", variant: "icon", url: null },
  ]);
  const [brandFonts, setBrandFonts] = useState<BrandTypography[]>([
    { id: "f1", family: "Inter", weight: "700", role: "heading" },
    { id: "f2", family: "Inter", weight: "400", role: "body" },
  ]);
  const [brandGuidelines] = useState<BrandGuidelinesDoc[]>([
    { id: "g1", section: "Logo Usage", content: "Maintain clear space equal to icon height.", updatedAt: new Date().toISOString() },
    { id: "g2", section: "Color", content: "Primary violet for CTAs; secondary blue for accents.", updatedAt: new Date().toISOString() },
  ]);
  const [products, setProducts] = useState<ProductAsset[]>([
    { id: "prod-1", name: "OmniMind Pro", sku: "OMN-PRO", price: 99, currency: "USD", variantIds: [], imageIds: [], category: "Software" },
  ]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [activeProductTool, setActiveProductTool] = useState<ProductStudioTool | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [copyDrafts, setCopyDrafts] = useState<CopyDraft[]>([]);
  const [adCreatives, setAdCreatives] = useState<AdCreative[]>([
    { id: "ad-1", platform: "meta", headline: "Transform Your Brand", description: "AI-powered creative suite", cta: "Learn More", variationLabel: "A", abTestGroup: "A", budgetShare: 50 },
  ]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: "ev-1", title: "Q2 Launch Post", date: "2026-04-15", type: "post", platform: "instagram", status: "scheduled" },
  ]);
  const [publishJobs, setPublishJobs] = useState<PublishJob[]>([]);
  const [analyticsSnapshots] = useState<AnalyticsSnapshot[]>([
    { id: "an-1", campaignId: "camp-1", metric: "reach", value: 125000, delta: 12, period: "30d" },
    { id: "an-2", campaignId: "camp-1", metric: "engagement", value: 4.8, delta: 0.6, period: "30d" },
    { id: "an-3", campaignId: "camp-1", metric: "ctr", value: 2.1, delta: -0.2, period: "30d" },
    { id: "an-4", campaignId: "camp-1", metric: "conversion", value: 3.4, delta: 0.8, period: "30d" },
    { id: "an-5", campaignId: "camp-1", metric: "roi", value: 240, delta: 18, period: "30d" },
  ]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "tm-1", name: "Alex Chen", email: "alex@omnimind.io", role: "owner", avatarColor: "#c084fc" },
    { id: "tm-2", name: "Sam Rivera", email: "sam@omnimind.io", role: "editor", avatarColor: "#38bdf8" },
  ]);
  const [teamComments, setTeamComments] = useState<TeamComment[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [versionHistory, setVersionHistory] = useState<VersionEntry[]>([]);
  const [plugins, setPlugins] = useState<MarketingPlugin[]>([
    { id: "plug-social", name: "Social Booster", category: "marketing", installed: true, version: "1.0" },
    { id: "plug-brand", name: "Brand Kit Pro", category: "brand-template", installed: false, version: "2.1" },
  ]);
  const [marketplaceTemplates] = useState<MarketplaceTemplate[]>(marketingPluginEngine.listMarketplace());
  const [promptLibrary] = useState<PromptTemplate[]>(SEED_PROMPTS.map((p) => ({ ...p, tags: [...p.tags] })));

  const activeCampaign = useMemo(
    () => campaignManagerEngine.getActive(project.campaigns, project.activeCampaignId) ?? null,
    [project.campaigns, project.activeCampaignId],
  );

  const analyticsSummary = useMemo(
    () => analyticsEngine.computeSummary(analyticsSnapshots),
    [analyticsSnapshots],
  );

  const commitProject = useCallback((updater: (p: MarketingProject) => MarketingProject) => {
    setProject((prev) => {
      const next = { ...updater(prev), version: prev.version + 1, modifiedAt: new Date().toISOString() };
      void visionaryMarketingApi.saveProject(next).catch(() => undefined);
      return next;
    });
  }, []);

  const addCampaign = useCallback(
    (name: string, objective: string) => {
      commitProject((p) => ({
        ...p,
        campaigns: campaignManagerEngine.create(p.campaigns, name, objective),
      }));
    },
    [commitProject],
  );

  const updateCampaignStatus = useCallback(
    (id: string, status: Campaign["status"]) => {
      commitProject((p) => ({
        ...p,
        campaigns: campaignManagerEngine.updateStatus(p.campaigns, id, status),
      }));
    },
    [commitProject],
  );

  const updateBrandIdentity = useCallback((patch: Partial<BrandIdentity>) => {
    setBrandIdentity((prev) => brandStudioEngine.updateIdentity(prev, patch));
  }, []);

  const addBrandColor = useCallback((hex: string, role: BrandColor["role"]) => {
    setBrandColors((prev) => brandStudioEngine.createColor(prev, hex, role));
  }, []);

  const addBrandLogo = useCallback((name: string, variant: BrandLogo["variant"]) => {
    setBrandLogos((prev) => brandStudioEngine.createLogo(prev, name, variant));
  }, []);

  const addBrandFont = useCallback((family: string, role: BrandTypography["role"]) => {
    setBrandFonts((prev) => brandStudioEngine.createFont(prev, family, role));
  }, []);

  const addProduct = useCallback((name: string, sku: string) => {
    setProducts((prev) => productStudioEngine.createProduct(prev, name, sku));
  }, []);

  const applyProductTool = useCallback((tool: ProductStudioTool) => {
    setActiveProductTool(tool);
    productStudioEngine.applyTool(tool);
  }, []);

  const schedulePost = useCallback((platform: SocialPlatform, caption: string, at: string) => {
    setSocialPosts((prev) => schedulingEngine.schedulePost(prev, platform, caption, at));
  }, []);

  const generateContent = useCallback(
    (format: ContentFormat, title: string, prompt: string) => {
      const item = contentFactoryEngine.queue([format], title, prompt, project.activeCampaignId);
      setContentItems((prev) => [item, ...prev]);
      setTimeout(() => {
        setContentItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? contentFactoryEngine.markReady(i, `asset-${item.id}`) : i,
          ),
        );
      }, 800);
    },
    [project.activeCampaignId],
  );

  const generateCopy = useCallback(
    (type: CopyType, title: string) => {
      const draft: CopyDraft = {
        id: `copy-${Date.now()}`,
        type,
        title,
        body: `AI-generated ${type} for ${title} — architecture stub.`,
        tone: "professional",
        campaignId: project.activeCampaignId,
      };
      setCopyDrafts((prev) => [draft, ...prev]);
    },
    [project.activeCampaignId],
  );

  const addAdCreative = useCallback((platform: AdPlatform) => {
    setAdCreatives((prev) => [
      ...prev,
      {
        id: `ad-${Date.now()}`,
        platform,
        headline: "New Ad Variation",
        description: "",
        cta: "Shop Now",
        variationLabel: String.fromCharCode(65 + prev.length),
        abTestGroup: prev.length % 2 === 0 ? "A" : "B",
        budgetShare: 25,
      },
    ]);
  }, []);

  const addCalendarEvent = useCallback((title: string, date: string) => {
    setCalendarEvents((prev) => schedulingEngine.createEvent(prev, title, date, "post"));
  }, []);

  const queuePublish = useCallback((postId: string, platform: SocialPlatform) => {
    const at = new Date().toISOString();
    setPublishJobs((prev) => publishingEngine.queue(prev, postId, platform, at));
    void visionaryMarketingApi.queuePublish({ postId, platform, scheduledAt: at });
  }, []);

  const addTeamMember = useCallback((name: string, email: string, role: TeamMember["role"]) => {
    setTeamMembers((prev) => teamWorkspaceEngine.addMember(prev, name, email, role));
  }, []);

  const addComment = useCallback((assetId: string, body: string) => {
    setTeamComments((prev) => teamWorkspaceEngine.addComment(prev, assetId, "tm-1", body));
  }, []);

  const requestApproval = useCallback((itemId: string, itemType: ApprovalRequest["itemType"]) => {
    setApprovalRequests((prev) => teamWorkspaceEngine.requestApproval(prev, itemId, itemType, "tm-1"));
  }, []);

  const saveVersion = useCallback((label: string) => {
    setVersionHistory((prev) => teamWorkspaceEngine.snapshot(prev, label, "tm-1"));
  }, []);

  const installPlugin = useCallback((id: string) => {
    setPlugins((prev) => marketingPluginEngine.install(prev, id));
  }, []);

  const saveProject = useCallback(() => {
    void visionaryMarketingApi.saveProject(project);
  }, [project]);

  useEffect(() => {
    void visionaryMarketingApi.loadProject(project.id).catch(() => undefined);
  }, [project.id]);

  const value = useMemo<VisionaryMarketingContextValue>(
    () => ({
      project,
      workspaceMode,
      setWorkspaceMode,
      activeCampaign,
      setActiveCampaignId: (id) => commitProject((p) => ({ ...p, activeCampaignId: id })),
      addCampaign,
      updateCampaignStatus,
      brandIdentity,
      updateBrandIdentity,
      brandColors,
      addBrandColor,
      brandLogos,
      addBrandLogo,
      brandFonts,
      addBrandFont,
      brandGuidelines,
      products,
      addProduct,
      productVariants,
      activeProductTool,
      setActiveProductTool,
      applyProductTool,
      socialPosts,
      schedulePost,
      contentItems,
      generateContent,
      copyDrafts,
      generateCopy,
      adCreatives,
      addAdCreative,
      calendarEvents,
      addCalendarEvent,
      publishJobs,
      queuePublish,
      analyticsSnapshots,
      analyticsSummary,
      teamMembers,
      addTeamMember,
      teamComments,
      addComment,
      approvalRequests,
      requestApproval,
      versionHistory,
      saveVersion,
      plugins,
      installPlugin,
      marketplaceTemplates,
      promptLibrary,
      saveProject,
    }),
    [
      project,
      workspaceMode,
      activeCampaign,
      commitProject,
      addCampaign,
      updateCampaignStatus,
      brandIdentity,
      updateBrandIdentity,
      brandColors,
      addBrandColor,
      brandLogos,
      addBrandLogo,
      brandFonts,
      addBrandFont,
      brandGuidelines,
      products,
      addProduct,
      productVariants,
      activeProductTool,
      applyProductTool,
      socialPosts,
      schedulePost,
      contentItems,
      generateContent,
      copyDrafts,
      generateCopy,
      adCreatives,
      addAdCreative,
      calendarEvents,
      addCalendarEvent,
      publishJobs,
      queuePublish,
      analyticsSnapshots,
      analyticsSummary,
      teamMembers,
      addTeamMember,
      teamComments,
      addComment,
      approvalRequests,
      requestApproval,
      versionHistory,
      saveVersion,
      plugins,
      installPlugin,
      marketplaceTemplates,
      promptLibrary,
      saveProject,
    ],
  );

  return <VisionaryMarketingContext.Provider value={value}>{children}</VisionaryMarketingContext.Provider>;
}

export function useVisionaryMarketing() {
  const ctx = useContext(VisionaryMarketingContext);
  if (!ctx) throw new Error("useVisionaryMarketing must be used within VisionaryMarketingProvider");
  return ctx;
}
