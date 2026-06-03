import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: "#f4f6fb",
          100: "#e6ecf6",
          200: "#c9d5ea",
          300: "#9db1d6",
          400: "#6c87bd",
          500: "#4a68a4",
          600: "#395189",
          700: "#2f4170",
          800: "#1f2c4e",
          900: "#0f1a36",
          950: "#070f24",
        },
        sage: {
          50: "#f1f8f4",
          100: "#dcedde",
          200: "#bcdcc3",
          300: "#8fc39d",
          400: "#5fa377",
          500: "#3f8459",
          600: "#2e6845",
          700: "#255339",
          800: "#1f422f",
          900: "#193626",
        },
        // Accent unique « laiton » — autorité éditoriale, parcimonie (CTA, détails)
        brass: {
          50: "#faf6ee",
          100: "#f3ebd8",
          200: "#e6d5af",
          300: "#d4ba7e",
          400: "#c4a25a",
          500: "#b08d4f",
          600: "#97763f",
          700: "#7a5f33",
          800: "#5f4a29",
          900: "#4a3a21",
        },
        // Fond papier chaud — registre cabinet, plus chaleureux que le bleu froid
        paper: {
          DEFAULT: "#f8f6f1",
          50: "#fbfaf6",
          100: "#f3f0e8",
          200: "#e8e3d6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(15, 26, 54, 0.18)",
        card: "0 1px 2px rgba(15, 26, 54, 0.04), 0 8px 24px -16px rgba(15, 26, 54, 0.18)",
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
    },
  },
  plugins: [],
};

export default config;
