export const weaviateOpenSource = [
  {
    questionText:
      "What is the difference in the Weaviate codebase between local and cloud deployments?",
    answerOptions: [
      {
        answerText: "Cloud deployments always include additional modules.",
        isCorrect: false,
        feedback:
          "Cloud deployments of Weaviate do not include any special, or additional, modules.",
      },
      {
        answerText: "Local deployments are optimized for GPU use.",
        isCorrect: false,
        feedback:
          "GPU usage can be enabled for inference whether locally or remotely deployed.",
      },
      {
        answerText: "Cloud deployments are optimized for scalability.",
        isCorrect: false,
        feedback:
          "We agree that cloud deployments should be optimized for scalability. But the Weaviate codebase is built for scalability regardless of deployment location.",
      },
      {
        answerText: "None, they are the same.",
        isCorrect: true,
        feedback:
          "They are the same, open-source codebase available on GitHub.",
      },
    ],
  },
];
export const vectorSearchDefinition = [
  {
    questionText: "What is the best description of vector search?",
    answerOptions: [
      {
        answerText: "Vector search is a directional search.",
        isCorrect: false,
        feedback:
          'The definition of "vector" in this context is not direction-related.',
      },
      {
        answerText: "Vector search is a similarity-based search.",
        isCorrect: true,
        feedback:
          'It searches a data collection or database for proximity in its representation of "meaning".',
      },
      {
        answerText: "Vector search is a number-based search.",
        isCorrect: false,
        feedback:
          "This is partially true, but not the best answer. While there are numbers involved, that description does not quite capture the key concept of vector searches.",
      },
    ],
  },
];
