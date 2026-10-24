import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";

type Seen = { url: string; key?: string; contentType?: string; body: string };
const seen: Seen[] = [];
let server: http.Server;

before(async () => {
  server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("latin1");
      seen.push({ url: req.url ?? "", key: req.headers["api-subscription-key"] as string, contentType: req.headers["content-type"], body });
      res.setHeader("content-type", "application/json");
      if (req.headers["api-subscription-key"] !== "test-key") {
        res.statusCode = 403;
        return res.end(JSON.stringify({ error: { message: "bad key" } }));
      }
      if (req.url === "/speech-to-text") return res.end(JSON.stringify({ transcript: "नमस्ते", language_code: "hi-IN" }));
      if (req.url === "/translate") return res.end(JSON.stringify({ translated_text: "translated:" + JSON.parse(body).input }));
      if (req.url === "/text-to-speech") return res.end(JSON.stringify({ audios: ["QUJD"] }));
      res.statusCode = 404;
      res.end("{}");
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  process.env.SARVAM_BASE_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  process.env.SARVAM_API_KEY = "test-key";
});

after(() => server.close());

test("speech-to-text sends multipart with auto language detection and the key in a header only", async () => {
  const { transcribe } = await import("../src/lib/sarvam/client");
  const out = await transcribe(new Blob(["audio"], { type: "audio/webm" }), "q.webm", "unknown");
  assert.deepEqual(out, { transcript: "नमस्ते", languageCode: "hi-IN" });
  const s = seen.at(-1)!;
  assert.equal(s.url, "/speech-to-text");
  assert.equal(s.key, "test-key");
  assert.match(s.contentType ?? "", /multipart\/form-data/);
  assert.match(s.body, /name="language_code"\r\n\r\nunknown/);
  assert.match(s.body, /name="model"\r\n\r\nsaaras:v4/);
  assert.ok(!s.body.includes("test-key"));
});

test("translate sends language codes and chunks long text", async () => {
  const { translate } = await import("../src/lib/sarvam/client");
  assert.equal(await translate("hello", "en-IN", "hi-IN"), "translated:hello");
  const before = seen.length;
  const long = Array.from({ length: 40 }, (_, i) => `Line number ${i} ` + "x".repeat(60)).join("\n");
  await translate(long, "en-IN", "ta-IN");
  assert.ok(seen.length - before >= 2, "long input should be split into several requests");
  for (const s of seen.slice(before)) assert.ok(JSON.parse(s.body).input.length <= 900);
  assert.equal(JSON.parse(seen.at(-1)!.body).target_language_code, "ta-IN");
});

test("text-to-speech returns base64 audio", async () => {
  const { synthesize } = await import("../src/lib/sarvam/client");
  assert.equal(await synthesize("नमस्ते", "hi-IN"), "QUJD");
  const body = JSON.parse(seen.at(-1)!.body);
  assert.equal(body.target_language_code, "hi-IN");
  assert.equal(body.model, "bulbul:v3");
});

test("a rejected key surfaces as a clear error", async () => {
  process.env.SARVAM_API_KEY = "wrong";
  const { translate, SarvamError } = await import("../src/lib/sarvam/client");
  await assert.rejects(() => translate("hello", "en-IN", "hi-IN"), (e: unknown) => e instanceof SarvamError && /rejected the API key/.test(e.message));
  process.env.SARVAM_API_KEY = "test-key";
});
