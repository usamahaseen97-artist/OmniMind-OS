import type { ABACPolicy, GovernanceRole } from "../types";

/** Attribute-based access control policies */
export class AttributeBasedAccess {
  private policies: ABACPolicy[] = [
    {
      id: "abac-dept-scope",
      name: "Department-scoped patient access",
      effect: "allow",
      attributes: { subject: { departmentScoped: "true" }, resource: { type: "patient" }, action: "read" },
      priority: 100,
      enabled: true,
    },
    {
      id: "abac-emergency",
      name: "Emergency override access",
      effect: "allow",
      attributes: { subject: { emergency: "true" }, resource: { type: "patient" }, action: "read" },
      priority: 200,
      enabled: true,
    },
    {
      id: "abac-research-anonymized",
      name: "Research anonymized data only",
      effect: "allow",
      attributes: { subject: { role: "research-user" }, resource: { anonymized: "true" }, action: "read" },
      priority: 90,
      enabled: true,
    },
  ];

  evaluate(context: {
    role: GovernanceRole;
    action: string;
    resource: Record<string, string>;
    subject?: Record<string, string>;
    environment?: Record<string, string>;
  }): { allowed: boolean; matchedPolicy?: string } {
    const sorted = [...this.policies].filter((p) => p.enabled).sort((a, b) => b.priority - a.priority);
    for (const policy of sorted) {
      const subjectMatch = Object.entries(policy.attributes.subject).every(
        ([k, v]) => context.subject?.[k] === v || context.role === v,
      );
      const resourceMatch = Object.entries(policy.attributes.resource).every(([k, v]) => context.resource[k] === v);
      const actionMatch = policy.attributes.action === context.action;
      if (subjectMatch && resourceMatch && actionMatch) {
        return { allowed: policy.effect === "allow", matchedPolicy: policy.id };
      }
    }
    return { allowed: true };
  }

  registerPolicy(policy: ABACPolicy) {
    this.policies.push(policy);
    return policy;
  }

  listPolicies() {
    return [...this.policies];
  }
}

let abac: AttributeBasedAccess | null = null;

export function getAttributeBasedAccess() {
  if (!abac) abac = new AttributeBasedAccess();
  return abac;
}
