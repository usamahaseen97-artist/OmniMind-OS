import type { ProjectType } from "../omniforge-engineering/types";

export type EnterpriseProjectTypeOption = {
  id: ProjectType;
  label: string;
  hint: string;
  category: "web" | "mobile" | "enterprise" | "specialized";
};

/** Full enterprise project catalog — extends wizard PROJECT_TYPE_OPTIONS. */
export const ENTERPRISE_PROJECT_TYPES: EnterpriseProjectTypeOption[] = [
  { id: "website", label: "Website", hint: "Marketing or content site", category: "web" },
  { id: "web_app", label: "Web App", hint: "Interactive SaaS-style application", category: "web" },
  { id: "mobile_app", label: "Mobile App", hint: "iOS / Android or PWA", category: "mobile" },
  { id: "desktop_app", label: "Desktop App", hint: "Electron or native shell", category: "mobile" },
  { id: "api", label: "Backend API", hint: "REST or GraphQL service", category: "web" },
  { id: "microservices", label: "Microservices", hint: "Distributed service mesh", category: "enterprise" },
  { id: "game", label: "Game", hint: "Canvas, Phaser, or web game", category: "specialized" },
  { id: "chrome_extension", label: "Chrome Extension", hint: "Browser extension", category: "specialized" },
  { id: "browser_extension", label: "Browser Extension", hint: "Cross-browser extension", category: "specialized" },
  { id: "cli_tool", label: "CLI Tool", hint: "Command-line utility", category: "specialized" },
  { id: "ai_agent", label: "AI Agent", hint: "Autonomous assistant product", category: "enterprise" },
  { id: "saas", label: "SaaS", hint: "Subscription software platform", category: "enterprise" },
  { id: "erp", label: "Enterprise ERP", hint: "Resource planning suite", category: "enterprise" },
  { id: "crm", label: "CRM", hint: "Customer relationship management", category: "enterprise" },
  { id: "cms", label: "CMS", hint: "Content management system", category: "enterprise" },
  { id: "ecommerce", label: "E-Commerce", hint: "Online store with checkout", category: "enterprise" },
  { id: "portfolio", label: "Portfolio", hint: "Personal or agency showcase", category: "web" },
  { id: "landing_page", label: "Landing Page", hint: "Single-page conversion funnel", category: "web" },
  { id: "hospital_system", label: "Hospital System", hint: "Healthcare EMR / patient portal", category: "enterprise" },
  { id: "banking_system", label: "Banking System", hint: "FinTech core banking", category: "enterprise" },
  { id: "education_platform", label: "Education Platform", hint: "LMS / e-learning", category: "enterprise" },
  { id: "robotics", label: "Robotics", hint: "Control systems & simulation", category: "specialized" },
  { id: "iot", label: "IoT", hint: "Device fleet & telemetry", category: "specialized" },
  { id: "blockchain", label: "Blockchain", hint: "Web3 dApp or smart contracts", category: "specialized" },
];

export function labelForEnterpriseProjectType(id: ProjectType): string {
  return ENTERPRISE_PROJECT_TYPES.find((t) => t.id === id)?.label ?? id;
}
