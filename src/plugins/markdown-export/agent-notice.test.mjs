// Run with: node --test "src/plugins/markdown-export/*.test.mjs"
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";
import { readAgentNotice } from "./agent-notice.mjs";

const SITE_DIR = fileURLToPath(new URL("../../..", import.meta.url));

describe("readAgentNotice", () => {
  test("loads src/data/agent-notice.json as one blockquote line", async () => {
    assert.match(await readAgentNotice(SITE_DIR), /^> \S[^\n]*\n\n$/);
  });

  test("rejects empty text", async (t) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-notice-"));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    await fs.mkdir(path.join(dir, "src/data"), { recursive: true });
    await fs.writeFile(path.join(dir, "src/data/agent-notice.json"), '{ "text": " " }');

    await assert.rejects(readAgentNotice(dir), /non-empty string/);
  });
});
