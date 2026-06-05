import { execSync } from "child_process";
import { mkdirSync } from "fs";

import dotenv from "dotenv";

dotenv.config({ path: ".env.test", override: true });

export default async function globalSetup() {
  execSync("npx prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
  });
  mkdirSync("tests/.auth", { recursive: true });
}
