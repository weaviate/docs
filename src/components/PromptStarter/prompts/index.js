// Central export for all page-specific prompts
// Add new prompt files here as they are created

import * as quickstart from "./quickstart";

// Map of page identifiers to their prompts
// Each entry should have: { fullPrompt: { python, typescript }, condensedPrompt: { python, typescript } }
export const prompts = {
  quickstart,
  // Future pages can be added here:
  // search: searchPrompts,
  // agents: agentsPrompts,
  // rag: ragPrompts,
};

// Cursor deeplink character limit
export const CURSOR_CHAR_LIMIT = 8000;

// Helper to get prompts for a specific page
export function getPromptsForPage(page) {
  const pagePrompts = prompts[page];
  if (!pagePrompts) {
    console.warn(`No prompts found for page: ${page}. Available pages: ${Object.keys(prompts).join(", ")}`);
    return null;
  }
  return pagePrompts;
}

// Re-export quickstart as default for backwards compatibility
export { quickstart };
