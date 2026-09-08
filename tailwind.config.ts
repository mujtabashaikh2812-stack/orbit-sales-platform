import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D13",
        surface: {
          DEFAULT: "#12151F",
          raised: "#1A1E2C",
          overlay: "#222738",
          hover: "#262B3D",
        },
        border: {
          DEFAULT: "#222738",
          subtle: "rgba(255, 255, 255, 0.07)",
          highlight: "rgba(212, 163, 89, 0.35)",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        accent: {
          DEFAULT: "#D4A359",
          hover: "#C29147",
          subtle: "rgba(212, 163, 89, 0.12)",
          glow: "rgba(212, 163, 89, 0.25)",
        },
        success: "#10B981",
        danger: "#F43F5E",
        warning: "#F59E0B",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 25px -4px rgba(0, 0, 0, 0.5), 0 4px 10px -2px rgba(0, 0, 0, 0.4)",
        glow: "0 0 25px -5px rgba(212, 163, 89, 0.25)",
        "inner-highlight": "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
