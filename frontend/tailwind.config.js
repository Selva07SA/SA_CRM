/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490"
        }
      },
      boxShadow: {
        card: "0 8px 28px rgba(19,32,27,0.08)",
        soft: "0 4px 14px rgba(19,32,27,0.08)"
      }
    }
  },
  plugins: []
};