/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/docs/en/main/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import {
  createSentryHandleError,
  wrapSentryHandleRequest,
} from "@sentry/react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import type { EntryContext, RouterContextProvider } from "react-router";

import { NonceContext } from "./nonce";
import { toError } from "./utils/errorUtils.server";

export const handleError = createSentryHandleError({
  logErrors: false,
});

export const streamTimeout = 5000;

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://cdn.plaid.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
    "worker-src blob: 'self'",
    "frame-src https://cdn.plaid.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

function generateNonce() {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

function setSecurityHeaders(headers: Headers, nonce: string) {
  headers.set("Content-Security-Policy", buildCsp(nonce));
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()",
  );
}

async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  loadContext: RouterContextProvider,
) {
  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        reactRouterContext,
        loadContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        reactRouterContext,
        loadContext,
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  _loadContext: RouterContextProvider,
) {
  return new Promise((resolve, reject) => {
    const nonce = generateNonce();
    const { abort, pipe } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          nonce={nonce}
        />
      </NonceContext.Provider>,
      {
        nonce,
        onAllReady() {
          const body = new PassThrough();

          setSecurityHeaders(responseHeaders, nonce);
          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          const err = toError(error);
          reject(err);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error(error);
        },
      },
    );

    // Automatically timeout the React renderer after 6 seconds, which ensures
    // React has enough time to flush down the rejected boundary contents
    setTimeout(abort, streamTimeout + 1000);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  _loadContext: RouterContextProvider,
) {
  return new Promise((resolve, reject) => {
    const nonce = generateNonce();
    const { abort, pipe } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          nonce={nonce}
        />
      </NonceContext.Provider>,
      {
        nonce,
        onShellReady() {
          const body = new PassThrough();

          setSecurityHeaders(responseHeaders, nonce);
          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          const err = toError(error);
          reject(err);
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      },
    );

    // Automatically timeout the React renderer after 6 seconds, which ensures
    // React has enough time to flush down the rejected boundary contents
    setTimeout(abort, streamTimeout + 1000);
  });
}
export default wrapSentryHandleRequest(handleRequest);
