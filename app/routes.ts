import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("healthcheck", "./routes/healthcheck.tsx"),
  route("join", "./routes/join.tsx"),
  route("login", "./routes/login.tsx"),
  route("logout", "./routes/logout.tsx"),

  route("users", "./routes/users/layout.tsx", [
    index("./routes/users/route.tsx"),
  ]),

  route("notes", "./routes/notes/layout.tsx", [
    index("./routes/notes/route.tsx"),
    route("new", "./routes/notes/new.tsx"),
    route(":noteId", "./routes/notes/$noteId.tsx"),
  ]),

  route("accounts", "./routes/accounts/layout.tsx", [
    index("./routes/accounts/route.tsx"),
    route("new", "./routes/accounts/new/route.tsx"),
    route(":accountId", "./routes/accounts/$accountId/layout.tsx", [
      index("./routes/accounts/$accountId/route.tsx"),
      route("balances", "./routes/accounts/$accountId/balances/layout.tsx", [
        route("new", "./routes/accounts/$accountId/balances/new/route.tsx"),
        route(
          "import",
          "./routes/accounts/$accountId/balances/import/route.tsx",
        ),
        route(
          ":balanceId",
          "./routes/accounts/$accountId/balances/$balanceId/route.tsx",
        ),
        route(
          ":balanceId/edit",
          "./routes/accounts/$accountId/balances/$balanceId/edit/route.tsx",
        ),
      ]),
    ]),
  ]),

  route("api/accounts/refresh", "./routes/api/accounts/refresh.ts"),
  route("api/subscription/stripe", "./routes/api/subscription/stripe.ts"),

  route("react_devtools_backend_compact.js.map", "./routes/dummy/devtools.tsx"),
  route("installHook.js.map", "./routes/dummy/hook.tsx"),
  route("passkeys.js.map", "./routes/dummy/passkeys.tsx"),
] satisfies RouteConfig;
