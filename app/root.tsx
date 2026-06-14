import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
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
import fontSizeStyles from "./components/_GlobalStyles/font-size.css?url";
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
  { rel: "stylesheet", href: fontSizeStyles },
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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main>
          <h1>{message}</h1>
          <p>{details}</p>
          {stack ? (
            <pre>
              <code>{stack}</code>
            </pre>
          ) : null}
        </main>
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const nonce = useNonce();
  const fetcher = useFetcher();
  let { colorMode } = useLoaderData<typeof loader>();

  // Tracks the system preference for use when no cookie is set.
  // Initialized to null to avoid a hydration mismatch (server can't read system pref).
  const [systemColorMode, setSystemColorMode] = useState<
    "dark" | "light" | null
  >(null);

  // Favicon always follows system preference regardless of the cookie.
  // Initialized to the light favicon so server and client agree on the initial render.
  const [faviconHref, setFaviconHref] = useState("/favicon-light.ico");

  useEffect(() => {
    logger.setUser(loaderData.user ? { id: loaderData.user.id } : null);
  }, [loaderData.user]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    // Sync initial state on hydration
    setFaviconHref(media.matches ? "/favicon-dark.ico" : "/favicon-light.ico");
    if (!colorMode) {
      setSystemColorMode(media.matches ? "dark" : "light");
    }

    const listener = (e: MediaQueryListEvent) => {
      // Favicon always follows system preference
      setFaviconHref(e.matches ? "/favicon-dark.ico" : "/favicon-light.ico");
      // Theme only follows system preference when no explicit cookie is set
      if (!colorMode) {
        const html = document.documentElement;
        html.classList.toggle("dark", e.matches);
        html.classList.toggle("light", !e.matches);
        setSystemColorMode(e.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [colorMode]);

  // use optimistic UI to immediately change the UI state
  if (fetcher.formData?.has("colorMode")) {
    colorMode = fetcher.formData.get("colorMode") === "dark" ? "dark" : "light";
  }

  // Cookie (or optimistic value) wins over detected system preference
  const effectiveColorMode = colorMode ?? systemColorMode;

  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href={faviconHref} type="image/x-icon" />
        {colorMode ? null : (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `(function(){var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.add(d?'dark':'light');})()`,
            }}
          />
        )}
        <Meta />
        <Links />
      </head>
      <body
        id="root"
        className={effectiveColorMode ?? undefined}
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Masthead user={loaderData.user}>
          <fetcher.Form method="post">
            <Button
              type="submit"
              name="colorMode"
              value={effectiveColorMode === "dark" ? "light" : "dark"}
            >
              {effectiveColorMode === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          </fetcher.Form>
        </Masthead>
        <main style={{ paddingTop: 0 }}>
          <Outlet />
        </main>
        <Footer user={loaderData.user} />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
