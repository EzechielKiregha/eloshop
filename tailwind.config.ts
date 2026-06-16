import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-electrolize)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-electrolize)", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#09090b",
        paper: "#fafafa",
        line: "#e4e4e7",
        ring: "hsl(240 5.9% 10%)",
        gold: {
          50: "#FFF9E6",
          100: "#FFF0BF",
          200: "#FFE699",
          300: "#FFD966",
          400: "#D4AF37",
          500: "#B8960C",
          600: "#9A7D0A",
          700: "#7D6508",
          800: "#5F4C06",
          900: "#423504",
          DEFAULT: "#D4AF37",
        },
      },
      boxShadow: {
        soft: "0 24px 80px rgba(9, 9, 11, 0.08)",
        gold: "0 4px 20px rgba(212, 175, 55, 0.15)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    }
  },
  plugins: [tailwindAnimate]
};

export default config;
