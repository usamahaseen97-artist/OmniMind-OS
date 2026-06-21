import type { IDEProjectFile } from "./omnimind-ide-config";
import { languageForPath } from "./omnimind-ide-config";

export const OMNIFORGE_SEED_MAIN_JS = `import { fetchProducts, renderCatalog } from "../product-modules/product.js";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export async function bootstrapEarbudsStore(root) {
  const products = await fetchProducts(API_BASE);
  renderCatalog(root, products);
  return products;
}

export async function addToCart(sku, qty = 1) {
  const res = await fetch(\`\${API_BASE}/api/cart\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sku, qty }),
  });
  if (!res.ok) throw new Error("Cart update failed");
  return res.json();
}

if (typeof document !== "undefined") {
  const root = document.getElementById("app-root");
  if (root) bootstrapEarbudsStore(root).catch(console.error);
}
`;

export const OMNIFORGE_SEED_PRODUCT_JS = `export async function fetchProducts(baseUrl) {
  const res = await fetch(\`\${baseUrl}/api/products\`);
  if (!res.ok) throw new Error("Product API unavailable");
  return res.json();
}

export function renderCatalog(root, products) {
  const hero = products.find((p) => p.sku === "earbuds-pro") ?? products[0];
  if (!hero) return;
  root.innerHTML = \`
    <section class="product-hero">
      <img src="\${hero.image}" alt="\${hero.name}" />
      <h1>\${hero.name}</h1>
      <p class="price">$\${hero.price}</p>
      <p>\${hero.description}</p>
      <button type="button" id="add-cart">Add to Cart</button>
    </section>\`;
}
`;

export const EARBUDS_CATALOG = [
  {
    sku: "earbuds-pro",
    name: "Earbuds Pro — Active Noise Cancelling",
    price: 220,
    description: "Premium wireless earbuds with ANC, spatial audio, and 32-hour battery life.",
    image: "/assets/earbuds-pro.png",
    colors: ["#111111", "#e879f9"],
  },
];

export const DEFAULT_MOBILE_LAYOUT_JSON = JSON.stringify(
  {
    blocks: [
      { id: "product-image", type: "product-image" },
      { id: "title-price", type: "title-price" },
      { id: "description", type: "description" },
      { id: "color-options", type: "color-options" },
      { id: "add-to-cart", type: "add-to-cart" },
    ],
    updatedAt: 1,
  },
  null,
  2,
);

export const OMNIFORGE_SEED_SERVER_PY = `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Earbuds Commerce API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

PRODUCTS = [
    {
        "sku": "earbuds-pro",
        "name": "Earbuds Pro — Active Noise Cancelling",
        "price": 220,
        "description": "Premium wireless earbuds with ANC and 32h battery.",
        "image": "/assets/earbuds-pro.png",
        "colors": ["#111111", "#e879f9"],
    }
]

@app.get("/api/products")
def list_products():
    return PRODUCTS

@app.post("/api/cart")
def add_to_cart(body: dict):
    return {"ok": True, "item": body}
`;

export function getOmniForgeSeedFiles(): IDEProjectFile[] {
  return [
    { path: ".omniforge/", content: "", isFolder: true },
    {
      path: ".omniforge/workspace.json",
      content: JSON.stringify({ template: "earbuds-commerce", version: 1 }, null, 2),
      language: "json",
    },
    { path: "src/", content: "", isFolder: true },
    { path: "assets/", content: "", isFolder: true },
    { path: "product-modules/", content: "", isFolder: true },
    { path: "src/main.js", content: OMNIFORGE_SEED_MAIN_JS, language: "javascript" },
    { path: "src/main.css", content: `.product-hero { padding: 1rem; font-family: system-ui; }\n.price { color: #00e5ff; font-weight: 700; }\n`, language: "css" },
    { path: "product-modules/product.js", content: OMNIFORGE_SEED_PRODUCT_JS, language: "javascript" },
    {
      path: "product-modules/catalog.json",
      content: JSON.stringify(EARBUDS_CATALOG, null, 2) + "\n",
      language: "json",
    },
    { path: ".omniforge/mobile-layout.json", content: DEFAULT_MOBILE_LAYOUT_JSON + "\n", language: "json" },
    { path: "server.py", content: OMNIFORGE_SEED_SERVER_PY, language: "python" },
    { path: ".gitignore", content: "node_modules/\n.env\n__pycache__/\n", language: "plaintext" },
    { path: "package.json", content: '{\n  "name": "omniforge-earbuds",\n  "private": true,\n  "type": "module"\n}\n', language: "json" },
    { path: "package-lock.json", content: '{\n  "name": "omniforge-earbuds",\n  "lockfileVersion": 3\n}\n', language: "json" },
    { path: "README.md", content: "# Earbuds Pro Commerce\n\nOmniForge workspace — apps, games, websites, business systems.\n", language: "markdown" },
  ];
}

export function pathToLanguage(path: string): string {
  return languageForPath(path);
}
