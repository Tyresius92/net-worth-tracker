import { http, passthrough } from "msw";
import { setupServer } from "msw/node";

import { plaidHandlers } from "./plaid";

// put one-off handlers that don't really need an entire file to themselves here
const miscHandlers = [
  http.post(`${process.env.REMIX_DEV_HTTP_ORIGIN}/ping`, () => passthrough()),
];

export const server = setupServer(...miscHandlers, ...plaidHandlers);

server.listen({ onUnhandledRequest: "bypass" });
// eslint-disable-next-line no-console
console.info("🔶 Mock server running");

// process.once("SIGINT", () => server.close());
// process.once("SIGTERM", () => server.close());
