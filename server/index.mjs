import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { createRequestHandler } from "@react-router/express";

import { createServerApp } from "./app.mjs";

const buildPath = path.resolve("build/server/index.js");
const build = await import(pathToFileURL(buildPath).href);

const assetsBuildDirectory = path.isAbsolute(build.assetsBuildDirectory)
  ? build.assetsBuildDirectory
  : path.resolve(process.cwd(), build.assetsBuildDirectory);

const app = createServerApp({
  assetsBuildDirectory,
  handler: createRequestHandler({ build, mode: process.env.NODE_ENV }),
});

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST;

const onListen = (error) => {
  if (error) {
    throw error;
  }
  console.log(`[server] http://${host ?? "localhost"}:${port}`);
};

const server = host
  ? app.listen(port, host, onListen)
  : app.listen(port, onListen);

["SIGTERM", "SIGINT"].map((signal) =>
  process.once(signal, () =>
    server.close((error) => {
      if (error) {
        console.error(error);
      }
    }),
  ),
);
