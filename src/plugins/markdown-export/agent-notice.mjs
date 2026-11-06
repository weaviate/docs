import fs from "node:fs/promises";
import path from "node:path";

/**
 * The agent notice as a Markdown blockquote line that follows the front matter.
 * Its text is in src/data/agent-notice.json, which src/theme/Root.js also renders.
 *
 * @param {string} siteDir
 * @returns {Promise<string>}
 */
export async function readAgentNotice(siteDir) {
  const file = path.join(siteDir, "src/data/agent-notice.json");
  const { text } = JSON.parse(await fs.readFile(file, "utf8"));
  if (typeof text !== "string" || !text.trim()) throw new Error(`${file}: "text" must be a non-empty string.`);
  return `> ${text.trim()}\n\n`;
}
