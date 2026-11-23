import { defineConfig, type TerserOptions, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import TsConfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 8030,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_APP_ENDPOINT || "http://localhost:3001",
          changeOrigin: true,
        },
      },
      hmr: {
        overlay: true,
      },
    },

    plugins: [react(), tailwindcss(), TsConfigPaths(), checker({ typescript: true })],

    cacheDir: "./.vite",

    resolve: {
      alias: {},
    },

    esbuild: {
      legalComments: "none",
    },

    build: {
      outDir: "build",
      chunkSizeWarningLimit: 1000,
      minify: "terser",
      terserOptions: {
        format: { comments: false },
      } as TerserOptions,
    },
  };
});
