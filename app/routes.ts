import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("healthcheck", "./routes/healthcheck.tsx"),
  route("join", "./routes/join.tsx"),
  layout("./routes/login/layout.tsx", [
    route("login", "./routes/login/route.tsx"),
    route("login/2fa", "./routes/login/2fa/route.tsx"),
    route("forgot-password", "./routes/forgot-password/route.tsx"),
    route("reset-password", "./routes/reset-password/route.tsx"),
  ]),
  route("logout", "./routes/logout.tsx"),

  route("contact", "./routes/contact/route.tsx"),
  route("contact/messages", "./routes/contact/messages/route.tsx"),

  route("privacy", "./routes/privacy/route.tsx"),

  route("settings", "./routes/settings/layout.tsx", [
    index("./routes/settings/route.tsx"),
    route("enable_mfa", "./routes/settings/enable_mfa/route.tsx"),
    route("recovery-codes", "./routes/settings/recovery-codes/route.tsx"),
    route("disable_mfa", "./routes/settings/disable_mfa/route.tsx"),
  ]),

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
    route("new/plaid", "./routes/accounts/new/plaid/route.tsx"),
    route(":accountId", "./routes/accounts/$accountId/layout.tsx", [
      index("./routes/accounts/$accountId/route.tsx"),
      route("edit", "./routes/accounts/$accountId/edit/route.tsx"),
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

  route("plaid_items", "./routes/plaid_items/layout.tsx", [
    index("./routes/plaid_items/route.tsx"),
    route(":itemId", "./routes/plaid_items/$itemId/layout.tsx", [
      index("./routes/plaid_items/$itemId/route.tsx"),
      route("update", "./routes/plaid_items/$itemId/update/route.tsx"),
    ]),
  ]),

  route("api/accounts/refresh", "./routes/api/accounts/refresh.ts"),

  ...(process.env["NODE_ENV"] === "development"
    ? [
        route(
          "react_devtools_backend_compact.js.map",
          "./routes/dummy/devtools.tsx",
        ),
        route("installHook.js.map", "./routes/dummy/hook.tsx"),
        route("passkeys.js.map", "./routes/dummy/passkeys.tsx"),
        route(
          ".well-known/appspecific/com.chrome.devtools.json",
          "./routes/dummy/chrome_devtools.tsx",
        ),
      ]
    : []),
] satisfies RouteConfig;
