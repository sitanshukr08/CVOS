import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#081018",
        sand: "#f4efe4",
        ember: "#efb346",
        tide: "#4eb8d8"
      },
      boxShadow: {
        float: "0 30px 80px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
} satisfies Config;
