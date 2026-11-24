import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vice: {
          black: "#080812",
          navy: "#0D0E21",
          indigo: "#151233",
          pink: "#FF3CAC",
          cyan: "#00E5FF",
          purple: "#8A2BE2",
          orange: "#FF8C42",
        },
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        sans: ["var(--font-rajdhani)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "neon-pink": "0 0 20px rgba(255, 60, 172, 0.45), 0 0 45px rgba(255, 60, 172, 0.2)",
        "neon-cyan": "0 0 20px rgba(0, 229, 255, 0.45), 0 0 45px rgba(0, 229, 255, 0.2)",
        "neon-purple": "0 0 24px rgba(138, 43, 226, 0.45), 0 0 50px rgba(138, 43, 226, 0.2)",
        "neon-orange": "0 0 20px rgba(255, 140, 66, 0.45), 0 0 45px rgba(255, 140, 66, 0.2)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-14px) scale(1.03)" },
        },
        "pulse-neon": {
          "0%, 100%": { opacity: "0.75" },
          "50%": { opacity: "1" },
        },
        "feedback-pop": {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "float-slow": "float-slow 8s ease-in-out infinite",
        "pulse-neon": "pulse-neon 3s ease-in-out infinite",
        "feedback-pop": "feedback-pop 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
