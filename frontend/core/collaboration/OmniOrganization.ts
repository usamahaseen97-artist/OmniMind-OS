import { MEMBER_SEED, ORG_SEED } from "./constants";
import type { Department, Organization, OrgMember } from "./types";

/** OmniOrganization — multi-tenant organization management. */
export class OmniOrganization {
  organizations: Organization[] = [...ORG_SEED];
  departments: Department[] = [
    { id: "dept-1", orgId: "org-1", name: "Engineering", parentId: null },
    { id: "dept-2", orgId: "org-1", name: "Design", parentId: null },
  ];
  members: OrgMember[] = [...MEMBER_SEED];
  activeOrgId: string | null = ORG_SEED[0]?.id ?? null;

  list() {
    return this.organizations;
  }

  get(id: string) {
    return this.organizations.find((o) => o.id === id) ?? null;
  }

  setActive(id: string) {
    if (!this.get(id)) return false;
    this.activeOrgId = id;
    return true;
  }

  active() {
    return this.activeOrgId ? this.get(this.activeOrgId) : null;
  }

  create(name: string, slug: string) {
    const org: Organization = {
      id: `org-${Date.now()}`,
      name,
      slug,
      plan: "team",
      memberCount: 1,
      settings: {},
      createdAt: new Date().toISOString(),
    };
    this.organizations.push(org);
    return org;
  }

  updateSettings(orgId: string, settings: Record<string, string>) {
    const org = this.get(orgId);
    if (!org) return null;
    org.settings = { ...org.settings, ...settings };
    return org;
  }

  listDepartments(orgId: string) {
    return this.departments.filter((d) => d.orgId === orgId);
  }

  listMembers(orgId: string) {
    return this.members.filter((m) => m.orgId === orgId);
  }

  addMember(orgId: string, member: Omit<OrgMember, "id" | "orgId">) {
    const m: OrgMember = { ...member, id: `mem-${Date.now()}`, orgId };
    this.members.push(m);
    const org = this.get(orgId);
    if (org) org.memberCount = this.listMembers(orgId).length;
    return m;
  }
}

export const omniOrganization = new OmniOrganization();
