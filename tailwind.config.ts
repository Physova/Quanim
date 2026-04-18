import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "jetbrains-mono": ["var(--font-jetbrains-mono)", "monospace"],
        "data": ["var(--font-jetbrains-mono)", "monospace"],
      },
      letterSpacing: {
        "tight-heading": "-0.05em",
      },
    },
  },
  plugins: [],
};

export default config;
