import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff1f4",
          100: "#ffe1e7",
          200: "#ffc7d3",
          300: "#ff9db1",
          400: "#ff6486",
          500: "#ff3d6e",
          600: "#ed1f56",
          700: "#c81247",
          800: "#a51141",
          900: "#88123d",
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "Roboto", "sans-serif"]
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      transitionDuration: {
        "250": "250ms",
      }
    }
  },
  plugins: []
} satisfies Config;
