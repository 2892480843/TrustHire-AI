import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// On GitHub Actions, GITHUB_REPOSITORY is "owner/repo". GitHub Project Pages
// are served from https://owner.github.io/repo/, so the base path must be
// "/repo/". Locally (and in tests) it falls back to "/".
// Override with VITE_BASE — e.g. "/" for a custom domain or a
// <user>.github.io user/org page.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const baseOverride = process.env.VITE_BASE?.trim();
const base = baseOverride || (repo ? `/${repo}/` : "/");

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          icons: ["lucide-react"]
        }
      }
    }
  }
});
