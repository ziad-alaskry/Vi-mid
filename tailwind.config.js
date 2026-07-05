/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          primary: "#3E7C6A",
          pressed: "#2A5648",
          tint: "#E4F1EC",
        },
        blueaccent: "#5FA8D3",
        surface: "#F4F8F6",
        hairline: "#E2E8E5",
        ink: { DEFAULT: "#1C2B26", soft: "#5A6B64" },
        danger: "#C0492F",
        star: "#E8A93C",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Tajawal", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
      },
      maxWidth: { app: "480px" },
      boxShadow: {
        soft: "0 1px 2px rgba(28,43,38,0.04), 0 6px 20px rgba(28,43,38,0.06)",
        tab: "0 -1px 0 #E2E8E5",
      },
    },
  },
  plugins: [],
};
