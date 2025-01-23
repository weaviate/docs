const Bm25Question = [
  {
    questionText: "What does a BM25 search do?",
    answerOptions: [
      {
        answerText:
          "Matches search terms between the query and data objects in the index and ranks results based on the frequency of those terms.",
        isCorrect: true,
        feedback:
          "It is a keyword search with ranking based on term frequency.",
      },
      {
        answerText: "Excludes objects based on the provided set of conditions.",
        isCorrect: false,
        feedback: "This describes a filter.",
      },
      {
        answerText:
          "Searches for exact matches of the entire query string in the index.",
        isCorrect: false,
        feedback:
          "This is describing a form of tokenization (field tokenization), not BM25 search.",
      },
    ],
  },
];
const wordTokenizationQuestion = [
  {
    questionText: "What does the `word` tokenization option do?",
    answerOptions: [
      {
        answerText: "Lowercases the query string and splits it by whitespace.",
        isCorrect: false,
        feedback: "This is only partially true.",
      },
      {
        answerText: "Indexes each string as-is.",
        isCorrect: false,
        feedback: "This is the `field` tokenization.",
      },
      {
        answerText:
          "Lowercases the query string, keeps alpha-numeric characters and splits it by whitespace.",
        isCorrect: true,
        feedback:
          "Understanding different tokenization options and their impact can be very useful.",
      },
    ],
  },
];
