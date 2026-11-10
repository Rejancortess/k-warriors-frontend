import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//,
            },
            {
              name: "firebase",
              test: /node_modules\/(@firebase|firebase)\//,
            },
            {
              name: "zxing",
              test: /node_modules\/@zxing\//,
            },
          ],
        },
      },
    },
  },
});
