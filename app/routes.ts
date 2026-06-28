import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("healthcheck", "./routes/healthcheck.tsx"),

  layout("./routes/login/layout.tsx", [
    route("login", "./routes/login/route.tsx"),
    route("login/2fa", "./routes/login/2fa/route.tsx"),
    route("forgot_password", "./routes/forgot_password/route.tsx"),
    route("reset_password", "./routes/reset_password/route.tsx"),
    route("join", "./routes/join.tsx"),
    route("verify_email", "./routes/verify_email/route.tsx"),
    route("verify_email/pending", "./routes/verify_email/pending/route.tsx"),
  ]),

  route("logout", "./routes/logout.tsx"),
  route("goodbye", "./routes/goodbye/route.tsx"),
  route("privacy", "./routes/privacy/route.tsx"),
  route("contact", "./routes/contact/route.tsx"),
  route("contact/messages", "./routes/contact/messages/route.tsx"),

  layout("./routes/authenticated_layout.tsx", [
    route("dashboard/:rangeSlug?", "./routes/dashboard/route.tsx"),

    route("settings", "./routes/settings/layout.tsx", [
      index("./routes/settings/route.tsx"),
      route("enable_mfa", "./routes/settings/enable_mfa/route.tsx"),
      route("recovery_codes", "./routes/settings/recovery_codes/route.tsx"),
      route("disable_mfa", "./routes/settings/disable_mfa/route.tsx"),
      route("change_password", "./routes/settings/change_password/route.tsx"),
      route("delete_account", "./routes/settings/delete_account/route.tsx"),
      route("export_data", "./routes/settings/export_data/route.tsx"),
      route("import_data", "./routes/settings/import_data/route.tsx"),
    ]),

    route("users", "./routes/users/layout.tsx", [
      index("./routes/users/route.tsx"),
      route(":userId", "./routes/users/$userId/route.tsx"),
      route(":userId/delete", "./routes/users/$userId/delete/route.tsx"),
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
  ]),

  route("api/subscriptions/plaid", "./routes/api/subscriptions/plaid.ts"),
  route("wp-admin/install.php", "./routes/dummy/wp_admin_install.tsx"),
  route("wp-login.php", "./routes/dummy/wp_login.tsx"),

  ...(process.env.NODE_ENV === "development"
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
