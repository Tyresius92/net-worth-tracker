import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("healthcheck", "./routes/healthcheck.tsx"),
  route("join", "./routes/join.tsx"),
  route("login", "./routes/login.tsx"),
  route("logout", "./routes/logout.tsx"),

  route("notes", "./routes/notes/layout.tsx", [
    index("./routes/notes/route.tsx"),
    route("new", "./routes/notes/new.tsx"),
    route(":noteId", "./routes/notes/$noteId.tsx"),
  ]),

  route("accounts", "./routes/accounts/layout.tsx", [
    index("./routes/accounts/route.tsx"),
    route("new", "./routes/accounts/new/route.tsx"),
    route(":accountId", "./routes/accounts/$accountId/layout.tsx", [
      index('./routes/accounts/$accountId/route.tsx'),
      route("balances/new", "./routes/accounts/$accountId/balances/new/route.tsx")
    ]),
  ]),

  route("react_devtools_backend_compact.js.map", "./routes/dummy/devtools.tsx"),
  route("installHook.js.map", "./routes/dummy/hook.tsx"),
] satisfies RouteConfig;
