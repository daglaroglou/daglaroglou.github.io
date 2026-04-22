import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { execSync } from "node:child_process";

function getBuildInfo() {
  const ghSha = process.env.GITHUB_SHA?.trim();
  let commitFull = "";
  let commitShort = "unknown";
  if (ghSha && ghSha.length >= 7) {
    commitFull = ghSha;
    commitShort = ghSha.slice(0, 7);
  } else {
    try {
      commitFull = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
      commitShort = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
    } catch {
      commitFull = "";
    }
  }
  const repository =
    process.env.GITHUB_REPOSITORY || "daglaroglou/daglaroglou.github.io";
  return {
    commitShort,
    commitFull,
    builtAt: new Date().toISOString(),
    repository,
  };
}

const buildInfo = getBuildInfo();

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [tailwindcss(), react()],
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    },
  },
}));
