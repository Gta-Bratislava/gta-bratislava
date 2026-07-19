import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        paper: "#08090a",
        acid: "#9dde18",
        line: "#28311c",
      },
      boxShadow: {
        lift: "0 24px 70px rgba(0,0,0,.42)",
      },
    },
  },
  plugins: [],
};

export default config;
