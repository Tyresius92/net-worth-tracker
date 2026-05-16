import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter } from "@sentry/react-router";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((config) => ({
  server: {
    port: 3000,
  },

  define: {
    "import.meta.env.APP_ENV": JSON.stringify(
      process.env.APP_ENV || "development",
    ),
  },

  plugins: [
    reactRouter(),
    tsconfigPaths(),
    sentryReactRouter(
      {
        org: "tyrel-clayton",
        project: "the-ledger",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
      config,
    ),
  ],

  optimizeDeps: {
    exclude: ["@sentry/react-router"],
  },
  clearScreen: false,
}));
