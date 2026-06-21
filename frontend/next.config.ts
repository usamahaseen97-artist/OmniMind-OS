import type { NextConfig } from "next";

const backendInternal =
  process.env.OMNIMIND_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001";

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  webpack: (config, { isServer }) => {
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
    ];
  },
};

export default nextConfig;
