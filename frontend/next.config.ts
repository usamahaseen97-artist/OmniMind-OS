import type { NextConfig } from "next";

const backendInternal =
  process.env.OMNIMIND_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001";

const nextConfig: NextConfig = {
  output: process.env.OMNIMIND_DOCKER_BUILD === "1" ? "standalone" : undefined,
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "motion"],
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@omnimind/sdk/node": false,
        "fs": false,
        "path": false,
        "child_process": false,
      };
    }
    if (isServer) {
      const externals = config.externals;
      const threeExternals = ["three", "@react-three/fiber", "@react-three/drei"];
      config.externals = Array.isArray(externals)
        ? [...externals, ...threeExternals]
        : externals
          ? [externals, ...threeExternals]
          : threeExternals;
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: backendInternal,
  },
  async rewrites() {
    return [
      {
        source: "/omni-api",
        destination: `${backendInternal}/`,
      },
      {
        source: "/omni-api/:path*",
        destination: `${backendInternal}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/",
        permanent: false,
      },
      {
        source: "/dashboard/:path*",
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/visionary-studio",
        destination: "/creative-visionary",
        permanent: false,
      },
      {
        source: "/visionary-studio/:path*",
        destination: "/creative-visionary/:path*",
        permanent: false,
      },
      {
        source: "/medical-diagnostic-suite",
        destination: "/medical-diagnostic",
        permanent: false,
      },
      {
        source: "/medical-diagnostic-suite/:path*",
        destination: "/medical-diagnostic/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
