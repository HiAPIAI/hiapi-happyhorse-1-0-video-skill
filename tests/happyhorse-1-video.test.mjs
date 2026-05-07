import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildHttpErrorMessage,
  buildVideoPayload,
  extractTaskId,
  extractVideoUrl,
  normalizeResolution,
  normalizeSeconds,
  normalizeSize,
  resolveConfig,
  saveVideoOutput,
} from "../scripts/lib/happyhorse-1-video.mjs";

test("builds the HiAPI video payload for HappyHorse 1.0 text-to-video", () => {
  assert.deepEqual(
    buildVideoPayload({
      prompt: "A wuxia swordswoman leaps across temple rooftops at dusk",
      seconds: "5",
      resolution: "1080p",
      size: "16:9",
    }),
    {
      model: "happyhorse-1-0",
      prompt: "A wuxia swordswoman leaps across temple rooftops at dusk",
      seconds: "5",
      resolution: "1080p",
      size: "16:9",
    },
  );
});

test("validates duration, resolution, and size before sending a request", () => {
  assert.equal(normalizeSeconds("3"), "3");
  assert.equal(normalizeSeconds(15), "15");
  assert.throws(() => normalizeSeconds("4"), /Unsupported duration/);

  assert.equal(normalizeResolution("720p"), "720p");
  assert.equal(normalizeResolution("1080P"), "1080p");
  assert.throws(() => normalizeResolution("480p"), /Unsupported resolution/);

  assert.equal(normalizeSize("9:16"), "9:16");
  assert.throws(() => normalizeSize("21:9"), /Unsupported size/);
});

test("supports ratio as an alias for the API size field", () => {
  const payload = buildVideoPayload({
    prompt: "A product teaser with cinematic lighting",
    ratio: "1:1",
  });

  assert.equal(payload.size, "1:1");
});

test("extracts task ids and video URLs from common HiAPI response shapes", () => {
  assert.equal(extractTaskId({ id: "video_task_123" }), "video_task_123");
  assert.equal(extractTaskId({ task_id: "task_456" }), "task_456");

  assert.equal(
    extractVideoUrl({ output: { url: "https://cdn.example.com/out.mp4" } }),
    "https://cdn.example.com/out.mp4",
  );
  assert.equal(
    extractVideoUrl({ metadata: { url: "https://cdn.example.com/meta.mp4" } }),
    "https://cdn.example.com/meta.mp4",
  );
});

test("resolveConfig requires HIAPI_API_KEY and normalizes base URL", () => {
  assert.throws(
    () => resolveConfig({}),
    /Get one at https:\/\/www\.hiapi\.ai\/en\/register/,
  );

  assert.deepEqual(
    resolveConfig({
      HIAPI_API_KEY: "test-key",
      HIAPI_BASE_URL: "https://api.hiapi.ai/",
    }),
    {
      apiKey: "test-key",
      baseUrl: "https://api.hiapi.ai",
    },
  );
});

test("buildHttpErrorMessage gives next actions for key, balance, invalid request, rate, and task failures", () => {
  assert.match(
    buildHttpErrorMessage(401, { error: { message: "Invalid API key" } }),
    /create a new one: https:\/\/www\.hiapi\.ai\/en\/register/,
  );
  assert.match(
    buildHttpErrorMessage(403, { error: { message: "token quota is not enough" } }),
    /balance or credits may be insufficient/i,
  );
  assert.match(
    buildHttpErrorMessage(400, { error: { message: "invalid size" } }),
    /duration, resolution, and size/i,
  );
  assert.match(
    buildHttpErrorMessage(429, { error: { message: "Too many requests" } }),
    /wait and retry/i,
  );
  assert.match(
    buildHttpErrorMessage(500, { error: { message: "task failed" } }),
    /try a clearer prompt/i,
  );
});

test("returns null when remote video download fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("fetch failed");
  };

  try {
    assert.equal(await saveVideoOutput("https://cdn.example.com/out.mp4"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
