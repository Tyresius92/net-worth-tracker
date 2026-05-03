import { defineConfig } from "cypress";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createCookieSessionStorage } from "react-router";
import { parse } from "cookie";
import * as dotenv from "dotenv";

import { CYPRESS_TEST_PASSWORD } from "./cypress/support/constants";

dotenv.config();

const prismaClient = new PrismaClient();
const USER_SESSION_KEY = "userId";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    secure: false,
  },
});

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const isDev = config.watchForFileChanges;
      const port = process.env.PORT ?? (isDev ? "3000" : "8811");
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
        screenshotOnRunFailure: !process.env.CI,
      };

      on("task", {
        log(message) {
          // eslint-disable-next-line no-console
          console.log(message);
          return null;
        },

        async createUser(email: string): Promise<string> {
          const hash = await bcrypt.hash(CYPRESS_TEST_PASSWORD, 10);
          const user = await prismaClient.user.create({
            data: {
              email,
              firstName: "Test",
              lastName: "User",
              password: { create: { hash } },
            },
          });
          const session = await sessionStorage.getSession(null);
          session.set(USER_SESSION_KEY, user.id);
          const setCookieHeader = await sessionStorage.commitSession(session);
          const { __session: cookieValue } = parse(setCookieHeader);
          return cookieValue;
        },

        async deleteUser(email: string): Promise<null> {
          try {
            await prismaClient.user.delete({ where: { email } });
          } catch {
            // user may already be gone
          }
          return null;
        },
      });

      return { ...config, ...configOverrides };
    },
  },
});
