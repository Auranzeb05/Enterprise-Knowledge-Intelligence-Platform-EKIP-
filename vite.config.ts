import {
  defineConfig,
} from "vite";

import {
  fileURLToPath,
  URL,
} from "node:url";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(
        new URL(
          "./src",
          import.meta.url
        )
      ),
    },
  },

  assetsInclude: [
    "**/*.svg",
    "**/*.csv",
  ],

  build: {
    /*
     * Route-level React.lazy() performs the
     * primary EKIP code splitting.
     *
     * Only the two largest specialized
     * dependency groups are manually separated.
     * Rollup is allowed to manage React and
     * transitive dependencies automatically,
     * preventing circular vendor chunks.
     */
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-supabase": [
            "@supabase/supabase-js",
          ],

          "vendor-charts": [
            "recharts",
          ],
        },
      },
    },

    chunkSizeWarningLimit:
      500,
  },
});
