import path from "node:path";

import compression from "compression";
import express from "express";
import morgan from "morgan";

/**
 * Builds the production Express app. Mirrors what `react-router-serve` does,
 * with one addition: `trust proxy`.
 *
 * Fly terminates TLS at its edge and forwards plain HTTP to this process,
 * setting `X-Forwarded-Proto: https`. Without `trust proxy`, Express reports
 * `req.protocol` as `http`, so React Router sees `http://` request URLs. That
 * breaks its CSRF origin check (browser `Origin` is `https://`) and makes
 * `url.origin` produce `http://` links in emails.
 *
 * Trust exactly one hop (the Fly edge) — not arbitrary `X-Forwarded-*` chains.
 */
export const createServerApp = ({ assetsBuildDirectory, handler }) => {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(compression());

  // Fingerprinted build assets can be cached forever.
  app.use(
    "/assets",
    express.static(path.join(assetsBuildDirectory, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );
  app.use(express.static(assetsBuildDirectory));
  app.use(express.static("public", { maxAge: "1h" }));
  app.use(
    "/.well-known",
    express.static(path.join(assetsBuildDirectory, ".well-known")),
  );

  app.use(morgan("tiny"));

  app.all("/{*splat}", handler);

  return app;
};
