export const urls = {
  chatGpt: "https://chat.openai.com/",
  claude: "https://claude.ai/new",
  gemini: "https://gemini.google.com/app",
  cursor: "https://cursor.com/link/prompt",
  weaviateDocsMcp: "/weaviate/mcp/docs-mcp-server",
  promptStarter: "https://docs.weaviate.io/prompts/",
  github: "https://raw.githubusercontent.com/weaviate/docs/refs/heads/main/",
  vsCode: "vscode:mcp/install?",
  cursorDeepLink: "cursor://anysphere.cursor-deeplink/mcp/install?",
};

// Helper function to get platform name from URL
export const getPlatformFromUrl = (url) => {
  if (url === urls.claude) return 'claude';
  if (url === urls.chatGpt) return 'chatgpt';
  if (url === urls.gemini) return 'gemini';
  if (url === urls.cursor) return 'cursor';
  return 'unknown';
};
