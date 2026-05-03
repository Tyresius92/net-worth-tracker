import { sentryReactRouter } from "@sentry/react-router";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((config) => ({
  server: {
    port: 3000,
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
}));
