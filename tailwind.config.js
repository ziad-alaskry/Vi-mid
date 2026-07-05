/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Every value here reads from the CSS variables defined once in
        // src/app/[locale]/globals.css — no hex literal is restated here.
        green: {
          primary: "var(--green-primary)",
          pressed: "var(--green-pressed)",
          tint: "var(--green-tint)",
          tintHover: "var(--green-tint-hover)",
          ring: "var(--green-ring)",
        },
        blue: {
          tint: "var(--blue-tint)",
          pressed: "var(--blue-pressed)",
        },
        surface: "var(--surface)",
        surfaceHover: "var(--surface-hover)",
        hairline: "var(--hairline)",
        ink: { DEFAULT: "var(--ink)", soft: "var(--ink-soft)" },
        danger: {
          DEFAULT: "var(--danger)",
          tint: "var(--danger-tint)",
          tintHover: "var(--danger-tint-hover)",
          soft: "var(--danger-soft)",
        },
        star: { DEFAULT: "var(--star)", muted: "var(--star-muted)" },
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
        tab: "0 -1px 0 var(--hairline)",
      },
    },
  },
  plugins: [],
};
