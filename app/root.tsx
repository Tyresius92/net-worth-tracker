import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { getUser } from "~/session.server";

import type { Route } from "./+types/root";
import styles from "./root.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {
    user: await getUser(request),
    ENV: {
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    },
  };
};

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="nav">
          <div>
            <Link to="/">Home</Link>
          </div>
          <div>
            <ul className="nav-links">
              {loaderData.user ? (
                <>
                  <li>
                    <Link to="/notes">Notes</Link>
                  </li>
                  <li>
                    <Link to="/accounts">Accounts</Link>
                  </li>
                  <li>
                    <Form>
                      <button type="submit">Log Out</button>
                    </Form>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/join">Join</Link>
                  </li>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
        <main className="main">
          <Outlet />
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
