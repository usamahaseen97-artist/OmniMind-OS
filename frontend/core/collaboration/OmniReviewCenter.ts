import type { ReviewRequest } from "./types";

/** OmniReviewCenter — review requests and approval workflows. */
export class OmniReviewCenter {
  requests: ReviewRequest[] = [];

  list(resourceId?: string) {
    return resourceId
      ? this.requests.filter((r) => r.resourceId === resourceId)
      : this.requests;
  }

  get(id: string) {
    return this.requests.find((r) => r.id === id) ?? null;
  }

  request(resourceId: string, requesterId: string, reviewerIds: string[]) {
    const req: ReviewRequest = {
      id: `rev-${Date.now()}`,
      resourceId,
      requesterId,
      reviewerIds,
      status: "pending",
    };
    this.requests.push(req);
    return req;
  }

  approve(id: string) {
    const req = this.get(id);
    if (!req) return false;
    req.status = "approved";
    return true;
  }

  requestChanges(id: string) {
    const req = this.get(id);
    if (!req) return false;
    req.status = "changes-requested";
    return true;
  }

  pending() {
    return this.requests.filter((r) => r.status === "pending");
  }
}

export const omniReviewCenter = new OmniReviewCenter();
