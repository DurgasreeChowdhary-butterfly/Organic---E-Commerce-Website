import type { Config } from "tailwindcss";

// Brand palette: premium pista green + organic/luxury accents.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pista: {
          50: "#F3F7E8",
          100: "#E4EECB",
          300: "#B9CE7F",
          500: "#8FA84D", // premium pista green - primary
          700: "#6B8E23",
          900: "#2F4014",
        },
        forest: {
          500: "#1F3D2B",
          700: "#14291D",
        },
        cream: "#FDF6EC",
        beige: "#EFE3CE",
        brown: {
          500: "#7A5230",
        },
        gold: "#C9A227",
        "soft-orange": "#E98A4E",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Inter'", "-apple-system", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "scale-in": "scaleIn 0.2s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(31, 61, 43, 0.08)",
        glass: "0 8px 32px rgba(31, 61, 43, 0.12)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
} satisfies Config;
