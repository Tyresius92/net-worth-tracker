/// <reference types="vitest" />
/// <reference types="vite/client" />

import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
dotenv.config({
  path: ".env.test",
  override: true,
});
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          globals: true,
          environment: "happy-dom",
          globalSetup: ["./test/global-setup.ts"],
          setupFiles: ["./test/setup-test-env.ts"],
          env: {
            DATABASE_URL: process.env.DATABASE_URL!,
            SESSION_SECRET: process.env.SESSION_SECRET!,
          },
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
