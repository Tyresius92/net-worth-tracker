/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

dotenv.config({ path: ".env.test", override: true });

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
});
