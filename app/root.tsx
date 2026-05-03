import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { useEffect } from "react";
import {
  isRouteErrorResponse,
  createCookie,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
} from "react-router";

import { logger } from "~/logger";

import { getUser } from "~/session.server";

import type { Route } from "./+types/root";
import lightColors from "./components/_GlobalStyles/colors.css?url";
import spaceStyles from "./components/_GlobalStyles/space.css?url";
import { Button } from "./components/Button/Button";
import { Footer } from "./components/Footer/Footer";
import { Masthead } from "./components/Masthead/Masthead";
import { useNonce } from "./nonce";
import styles from "./root.css?url";

export const prefs = createCookie("user-prefs");

export const meta: MetaFunction = () => [{ title: "Net Worth Tracker" }];

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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    // Only capture non-404 errors (all errors here are already non-RouteErrorResponse)
    logger.error(error);
    details = error.message;
    stack = error.stack;
  }

  return (
    <main>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack ? (
        <pre>
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const nonce = useNonce();
  const fetcher = useFetcher();
  let { colorMode } = useLoaderData<typeof loader>();

  useEffect(() => {
    logger.setUser(loaderData.user ? { id: loaderData.user.id } : null);
  }, [loaderData.user]);

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
        id="root"
        className={colorMode}
        style={{
          minHeight: "calc(100% - 24px)",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "var(--space-24)",
        }}
      >
        <Masthead user={loaderData.user}>
          <fetcher.Form method="post">
            <Button
              type="submit"
              name="colorMode"
              value={colorMode === "dark" ? "light" : "dark"}
            >
              {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          </fetcher.Form>
        </Masthead>
        <main>
          <Outlet />
        </main>
        <Footer user={loaderData.user} />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
