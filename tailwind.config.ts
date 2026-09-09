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
        ink: "#F8FAFC",
        surface: {
          DEFAULT: "#FFFFFF",
          raised: "#F1F5F9",
          overlay: "#FFFFFF",
          hover: "#F8FAFC",
        },
        border: {
          DEFAULT: "#E2E8F0",
          subtle: "rgba(0, 0, 0, 0.05)",
          highlight: "rgba(99, 102, 241, 0.35)",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
        accent: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          subtle: "rgba(79, 70, 229, 0.08)",
          glow: "rgba(99, 102, 241, 0.25)",
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
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 10px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.25)",
        "inner-highlight": "inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
