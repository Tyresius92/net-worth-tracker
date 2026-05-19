import { execSync } from "child_process";

export function setup() {
  execSync("npx prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
  });
}
