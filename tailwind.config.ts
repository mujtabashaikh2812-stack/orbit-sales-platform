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
        ink: "#12141A",
        surface: {
          DEFAULT: "#1B1E26",
          raised: "#22252E",
        },
        border: "#2A2E38",
        text: {
          primary: "#EDEBE6",
          secondary: "#9B9A94",
        },
        accent: {
          DEFAULT: "#B98F4D",
          hover: "#A67E40",
          subtle: "rgba(185, 143, 77, 0.15)",
        },
        success: "#6B8F71",
        danger: "#B0563A",
        warning: "#C9A15A",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "6px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
