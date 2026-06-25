import type { ProductAsset, ProductStudioTool, ProductVariant } from "./types";

export class ProductStudioEngine {
  createProduct(products: ProductAsset[], name: string, sku: string): ProductAsset[] {
    const id = `prod-${Date.now()}`;
    return [
      ...products,
      { id, name, sku, price: 0, currency: "USD", variantIds: [], imageIds: [], category: "General" },
    ];
  }

  addVariant(variants: ProductVariant[], productId: string, label: string): ProductVariant[] {
    return [...variants, { id: `var-${Date.now()}`, productId, label, color: null, size: null }];
  }

  applyTool(tool: ProductStudioTool): { status: string; outputId: string } {
    return { status: "stub-complete", outputId: `out-${tool}-${Date.now()}` };
  }
}

export const productStudioEngine = new ProductStudioEngine();
