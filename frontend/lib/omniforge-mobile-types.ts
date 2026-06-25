/** OmniForge mobile layout types — shared by store and preview data. */

export type MobileBlockType =
  | "product-image"
  | "title-price"
  | "description"
  | "color-options"
  | "add-to-cart";

export type MobileUiBlock = {
  id: string;
  type: MobileBlockType;
};
