import { http, HttpResponse, passthrough } from "msw";
import { setupServer } from "msw/node";

import { plaidHandlers } from "./plaid";

const miscHandlers = [
  http.post(`${process.env.REMIX_DEV_HTTP_ORIGIN}/ping`, () => passthrough()),
  http.post("https://api.resend.com/emails", () =>
    HttpResponse.json({ id: "mock-email-id" }),
  ),
];

export const server = setupServer(...miscHandlers, ...plaidHandlers);

server.listen({ onUnhandledRequest: "bypass" });
// eslint-disable-next-line no-console
console.info("🔶 Mock server running");

// process.once("SIGINT", () => server.close());
// process.once("SIGTERM", () => server.close());
