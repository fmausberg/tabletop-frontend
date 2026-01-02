import { lightningCssTransform } from "next/dist/build/swc/generated-native";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {},
        primaryButton: {
          DEFAULT: "#9333EA", // purple-500
          hover: "#581C87", // purple-700
          text: "#FFFFFF", // white
        },
        links: {
          DEFAULT: "#9333EA", // purple-500
          hover: "#581C87", // purple-700
        },
        navbar: {
          hover: "#e28d24ff", // purple-500
          background: "#413a15ff", // slate-800
          text: "#FFFFFF", // white
        },
        footer: {
          hover: "#e28d24ff", // purple-500
          background: "#413a15ff", // gray-100
          hoverLight: "#60A5FA", // blue-400
          hoverDark: "#2563EB", // blue-600
          text: "#FFFFFF", // white
        },
        textPrimary: {
          DEFAULT: "#1E293B", //  slate-800
          light: "#475569", //  slate-600
        },
        formsDesigns: {
          focus: "#9333EA", //  purple-500
          checkbox: "#9333EA", //  purple-500
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
