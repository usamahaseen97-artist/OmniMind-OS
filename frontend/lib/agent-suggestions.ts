import type { SovereignToolSlug } from "./sovereign-tool-registry";

export type AgentSuggestion = { label: string; prompt: string };

const BY_SLUG: Partial<Record<SovereignToolSlug | string, AgentSuggestion[]>> = {
  "app-builder": [
    { label: "Add Firebase Auth 🔐", prompt: "Add Firebase authentication with email and Google sign-in" },
    { label: "Deploy Landing Grid 🚀", prompt: "Deploy a responsive landing page grid with hero and CTA" },
    { label: "Greek Travel Card ✈️", prompt: "Add premium Greek travel destination card with gradient overlays" },
    { label: "Connect REST API 🔌", prompt: "Wire REST API client with typed fetch hooks" },
  ],
  "game-dev": [
    { label: "Physics Engine Loop 🎮", prompt: "Implement physics engine loop with collision detection" },
    { label: "Player Sprite HUD 🕹️", prompt: "Add player sprite movement and score HUD overlay" },
    { label: "Level Scene Loader 🗺️", prompt: "Load level1 scene with spawn points and boundaries" },
    { label: "WebGL Batch Render 🎨", prompt: "Optimize WebGL sprite batch rendering pipeline" },
  ],
  "business-site-maker": [
    { label: "Hero", prompt: "Build a conversion-focused hero section with headline, subcopy, and primary CTA" },
    { label: "Pricing 🏗️", prompt: "Add pricing tiers with feature comparison and annual billing toggle" },
    { label: "SEO Meta Pack 🔍", prompt: "Add SEO meta tags and OpenGraph blocks" },
    { label: "Contact Form 📬", prompt: "Implement contact form with validation" },
  ],
  "architectural-designer": [
    { label: "Marble Fountain Structure ⛲", prompt: "Add central marble fountain structure to courtyard" },
    { label: "Sunset Ray-Tracing Lighting 🌅", prompt: "Apply sunset ray-tracing lighting to exterior elevations" },
    { label: "Dual-Front Villa Massing 🏛️", prompt: "Design dual-front luxury villa skeletal massing" },
    { label: "Landscape Pool Axis 🏊", prompt: "Add landscape pool axis with garden perimeter" },
  ],
  "interior-landscape": [
    { label: "Scandinavian Minimalist Decor 🛋️", prompt: "Inject Scandinavian minimalist decor with neutral palette" },
    { label: "Sunset Ray-Tracing Lighting 🌅", prompt: "Apply sunset ray-tracing indoor lighting setup" },
    { label: "Open Plan Partition 🪟", prompt: "Configure open-plan partition with glass dividers" },
    { label: "Material Palette Swap 🧵", prompt: "Swap interior materials to warm oak and matte stone" },
  ],
  "digital-marketing-hub": [
    { label: "Video Ad Suggestions 🎥", prompt: "Generate 30s cinematic video ad with product reveal and neon lighting" },
    { label: "Image Ad Suggestions 🖼️", prompt: "Create ultra-realistic image ad with dynamic neon product placement" },
    { label: "Delhi Mutton Ad", prompt: "Design Dehli Mutton Pack campaign ad with spice celebration theme" },
    { label: "Brand Film", prompt: "Produce 60s brand film showcasing authentic Delhi mutton quality" },
  ],
  "business-analytics": [
    { label: "Sales Trend 📈", prompt: "Build last-week sales trend line breakdown" },
    { label: "Cohort Table 📊", prompt: "Generate customer cohort analysis table" },
    { label: "Margin KPIs 💹", prompt: "Show margin KPI cards with conditional formatting" },
  ],
  "vfx-master": [
    { label: "Cinematic Grade 🎞️", prompt: "Color grade clips to cinematic tone" },
    { label: "Sky Replace 🌌", prompt: "Replace sky with cyberpunk night overlay" },
    { label: "Lightning FX ⚡", prompt: "Apply 3D lightning overlay filter to timeline" },
  ],
  "creative-visionary": [
    { label: "Cinematic Meat Ad Lighting 🥩", prompt: "Generate cinematic meat product ad with dramatic rim lighting and steam" },
    { label: "8K Human Close-Up Portrait 📸", prompt: "Create 8K human model close-up portrait with soft key light and skin detail" },
    { label: "Sci-Fi Cyberpunk Corridor 🌌", prompt: "Render wide-angle sci-fi cyberpunk corridor with neon haze and volumetric fog" },
    { label: "Luxury Watch Macro 💎", prompt: "Ultra-realistic luxury watch macro product shot on black glass" },
  ],
  "nasa-solver": [
    { label: "Orbital Proof 🛰️", prompt: "Prove orbital mechanics equation set" },
    { label: "Calculus Matrix ∫", prompt: "Render calculus proof matrix overlay" },
  ],
  "medical-diagnostic": [
    { label: "Scan Analysis 🩺", prompt: "Analyze clinical scan for anomalies" },
  ],
  "quantum-trading": [
    { label: "NYSE Feed 📉", prompt: "Connect NYSE live feed with trend signals" },
  ],
};

export function getAgentSuggestions(slug: string): AgentSuggestion[] {
  return BY_SLUG[slug] ?? BY_SLUG["app-builder"]!;
}
