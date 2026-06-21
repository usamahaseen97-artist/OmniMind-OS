import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          gold: "#f6c453",
          amber: "#ffb347",
          ink: "#08070b",
          panel: "#111019"
        }
      },
      boxShadow: {
        glow: "0 0 32px rgba(246, 196, 83, 0.2)"
      },
      backgroundImage: {
        "golden-radial":
          "radial-gradient(circle at top right, rgba(246,196,83,0.22), rgba(246,196,83,0.05) 40%, rgba(0,0,0,0) 70%)"
      }
    }
  },
  plugins: []
};

export default config;
