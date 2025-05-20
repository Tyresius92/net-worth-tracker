import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import {
  createCookie,
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
} from "react-router";

import { getUser } from "~/session.server";

import type { Route } from "./+types/root";
import lightColors from "./components/_GlobalStyles/colors.css?url";
import spaceStyles from "./components/_GlobalStyles/space.css?url";
import { Box } from "./components/Box/Box";
import { NavLink } from "./components/NavLink/NavLink";
import styles from "./root.css?url";

export const prefs = createCookie("user-prefs");

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: lightColors },
  { rel: "stylesheet", href: spaceStyles },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};

  return {
    user: await getUser(request),
    ENV: {
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    },
    colorMode: cookie.colorMode,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};
  const formData = await request.formData();

  const colorMode = formData.get("colorMode") === "dark" ? "dark" : "light";
  cookie.colorMode = colorMode;

  return Response.json(colorMode, {
    headers: {
      "Set-Cookie": await prefs.serialize(cookie),
    },
  });
};

export default function App({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  let { colorMode } = useLoaderData<typeof loader>();

  // use optimistic UI to immediately change the UI state
  if (fetcher.formData?.has("colorMode")) {
    colorMode = fetcher.formData.get("colorMode") === "dark" ? "dark" : "light";
  }

  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={colorMode}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <nav className="nav">
          <Box>
            <h1>
              <NavLink to="/">Money Chomp</NavLink>
            </h1>
          </Box>
          <Box>
            <ul className="nav-links">
              {loaderData.user ? (
                <>
                  {loaderData.user.role === "admin" ? (
                    <li>
                      <NavLink to="/users">Users</NavLink>
                    </li>
                  ) : null}
                  <li>
                    <NavLink to="/notes">Notes</NavLink>
                  </li>
                  <li>
                    <NavLink to="/accounts">Accounts</NavLink>
                  </li>
                  <li>
                    <Form method="post" action="logout">
                      <button type="submit">Log Out</button>
                    </Form>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink to="/join">Join</NavLink>
                  </li>
                  <li>
                    <NavLink to="/login">Login</NavLink>
                  </li>
                </>
              )}
              <li>
                <fetcher.Form method="post">
                  <button
                    name="colorMode"
                    value={colorMode === "dark" ? "light" : "dark"}
                  >
                    {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                </fetcher.Form>
              </li>
            </ul>
          </Box>
        </nav>
        <main
          style={{
            flexGrow: 1,
            backgroundColor: "var(--color-indigo-2)",
            color: "var(--color-slate-12)",
          }}
        >
          <Box p={64}>
            <Outlet />
          </Box>
        </main>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(loaderData.ENV)}`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}
