import type { Config } from "tailwindcss";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neuronaut-blue': '#38bdf8', // Adjust to your specific color if needed
      },
      borderRadius: {
        'neuronaut-btn': '8px', // You can adjust this value as necessary
      },
      fontSize: {
        'neuronaut-btn': '14px', // Adjust as needed for button text
      },
    },
  },
  plugins: [],
};

export default config;

