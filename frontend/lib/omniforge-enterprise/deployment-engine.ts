import type { DeployStack } from "../omniforge-engineering/types";

export type DeploymentTarget = DeployStack | "netlify" | "kubernetes" | "digitalocean";

export type DeploymentPipeline = {
  id: string;
  target: DeploymentTarget;
  label: string;
  stages: string[];
  configFiles: { path: string; content: string }[];
};

const TARGET_META: Record<DeploymentTarget, { label: string; stages: string[] }> = {
  vercel: { label: "Vercel", stages: ["install", "build", "deploy-preview", "deploy-production"] },
  netlify: { label: "Netlify", stages: ["install", "build", "deploy"] },
  cloudflare: { label: "Cloudflare Pages", stages: ["build", "deploy"] },
  railway: { label: "Railway", stages: ["docker-build", "deploy"] },
  render: { label: "Render", stages: ["build", "deploy-web", "deploy-api"] },
  docker: { label: "Docker", stages: ["build-image", "push", "run"] },
  aws: { label: "AWS", stages: ["terraform-plan", "ecr-push", "ecs-deploy"] },
  azure: { label: "Azure", stages: ["build", "push-acr", "deploy-app-service"] },
  gcp: { label: "Google Cloud", stages: ["build", "push-gcr", "cloud-run-deploy"] },
  kubernetes: { label: "Kubernetes", stages: ["build", "push", "helm-upgrade"] },
  digitalocean: { label: "DigitalOcean", stages: ["build", "deploy-app-platform"] },
};

/** Generates deployment pipelines for all supported targets. */
export function generateDeploymentPipeline(target: DeploymentTarget, projectName: string): DeploymentPipeline {
  const meta = TARGET_META[target];
  const slug = projectName.toLowerCase().replace(/\s+/g, "-") || "omniforge-app";

  return {
    id: `deploy-${target}-${Date.now()}`,
    target,
    label: meta.label,
    stages: meta.stages,
    configFiles: pipelineFiles(target, slug),
  };
}

export function listDeploymentTargets(): DeploymentTarget[] {
  return Object.keys(TARGET_META) as DeploymentTarget[];
}

function pipelineFiles(target: DeploymentTarget, slug: string): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];

  files.push({
    path: ".github/workflows/deploy.yml",
    content: `name: Deploy ${slug}
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci && npm run build
      - name: Deploy to ${target}
        run: echo "Deploying ${slug} to ${target}"
`,
  });

  if (target === "docker" || target === "kubernetes" || target === "railway") {
    files.push({
      path: "Dockerfile",
      content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
CMD ["npm", "start"]
`,
    });
  }

  if (target === "kubernetes") {
    files.push({
      path: "k8s/deployment.yaml",
      content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${slug}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${slug}
  template:
    metadata:
      labels:
        app: ${slug}
    spec:
      containers:
        - name: app
          image: ${slug}:latest
          ports:
            - containerPort: 3000
`,
    });
  }

  return files;
}
