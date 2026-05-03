import "@testing-library/jest-dom/vitest";

import { resolve } from "path";

import dotenv from "dotenv";

import { initialize } from "~/__generated__/fabbrica";
import { prisma } from "~/db.server";

import { server } from "../mocks";
import { plaidMock } from "../mocks/plaid";

// Load .env.test (highest priority), then .env (fallback)
dotenv.config({ path: resolve(__dirname, "../.env") });
dotenv.config({ path: resolve(__dirname, "../.env.test") });

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  plaidMock.reset();
});
afterAll(() => server.close());

initialize({ prisma });
