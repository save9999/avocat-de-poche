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
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(15, 26, 54, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
