export const promptDetails = {
  quickstart_prompt: {
    description: "Build a working movie search app with vector search and RAG in 4 steps.",
    short: "The prompt will guide you to create a movie search demo application that uses vector and hybrid search to browse a movie collection.",
    features: [
      "Create a Movie collection with text2vec-weaviate vectorizer",
      "Import 5 sample movies (The Matrix, Inception, The Godfather, Spirited Away, The Dark Knight)",
      "Implement vector, hybrid, and keyword search modes",
      "Add Retrieval Augmented Generation (RAG) with Anthropic for AI-powered movie explanations"
    ]
  }
};

export function getPromptDetails(key) {
  return promptDetails[key] || null;
}
