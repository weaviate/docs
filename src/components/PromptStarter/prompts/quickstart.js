// Quickstart page prompts for all supported languages

const BASE_URL = 'https://prompt-starter--docs-weaviate-io.netlify.app';

export const prompt = {
  python: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-python.md`,

  typescript: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-typescript.md`,

  go: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-go.md`,

  java: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-java.md`,

  csharp: `Open this site and follow the instructions: ${BASE_URL}/prompts/quickstart-csharp.md`,
};

// Remove condensedPrompt - using the same prompt for all LLMs
export const condensedPrompt = prompt;
