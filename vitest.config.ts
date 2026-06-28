/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import invariant from "tiny-invariant";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

invariant(process.env.DATABASE_URL, "DATABASE_URL must be set");
invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

dotenv.config({
  path: ".env.test",
  override: true,
});
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    include: ["app/**/*.{test,spec}.{ts,tsx}"],
    globals: true,
    environment: "happy-dom",
    globalSetup: ["./test/global-setup.ts"],
    setupFiles: ["./test/setup-test-env.ts"],
    env: {
      DATABASE_URL: process.env.DATABASE_URL,
      SESSION_SECRET: process.env.SESSION_SECRET,
    },
  },
});
