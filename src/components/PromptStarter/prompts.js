// Prompts for all pages
// Add new page prompts here as they are created

const BASE_URL = 'https://prompt-starter--docs-weaviate-io.netlify.app';

// Quickstart page prompts
const quickstartPrompts = {
  python: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-python.md`,
  typescript: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-typescript.md`,
  go: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-go.md`,
  java: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-java.md`,
  csharp: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-csharp.md`,
};

// Map of page identifiers to their prompts
const prompts = {
  quickstart: { prompt: quickstartPrompts },
  // Future pages can be added here:
  // search: { prompt: searchPrompts },
  // agents: { prompt: agentsPrompts },
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
