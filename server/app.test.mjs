// @vitest-environment node
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createServerApp } from "./app.mjs";

const echoProtocol = (req, res) => {
  res.json({ protocol: req.protocol, url: `${req.protocol}://${req.host}` });
};

let assetsBuildDirectory;
let server;
let baseUrl;

beforeAll(async () => {
  assetsBuildDirectory = await mkdtemp(path.join(tmpdir(), "server-app-"));
  await mkdir(path.join(assetsBuildDirectory, "assets"));
  await writeFile(
    path.join(assetsBuildDirectory, "assets", "entry-abc123.js"),
    "export {};",
  );

  const app = createServerApp({ assetsBuildDirectory, handler: echoProtocol });
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(assetsBuildDirectory, { recursive: true, force: true });
});

describe("createServerApp", () => {
  it("reports https when the proxy forwards an https request", async () => {
    const response = await fetch(`${baseUrl}/users/abc/delete`, {
      headers: { "X-Forwarded-Proto": "https" },
    });

    expect(await response.json()).toMatchObject({ protocol: "https" });
  });

  it("reports http when there is no forwarded protocol", async () => {
    const response = await fetch(`${baseUrl}/users/abc/delete`);

    expect(await response.json()).toMatchObject({ protocol: "http" });
  });

  it("serves fingerprinted assets with immutable, year-long caching", async () => {
    const response = await fetch(`${baseUrl}/assets/entry-abc123.js`);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("does not advertise Express", async () => {
    const response = await fetch(`${baseUrl}/`);

    expect(response.headers.get("x-powered-by")).toBeNull();
  });
});
