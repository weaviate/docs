const hybridRankingQuestion = [
  {
    questionText: "How do hybrid searches order its search results?",
    answerOptions: [
      {
        answerText: "By multiplying the vector similarity with the BM25 score",
        isCorrect: false,
        feedback: "It does not do that, unfortunately.",
      },
      {
        answerText: "By averaging the vector and BM25 search rankings",
        isCorrect: false,
        feedback: "It does not do that, unfortunately.",
      },
      {
        answerText: "By summing the inverse of the vector and BM25 rankings",
        isCorrect: true,
        feedback:
          "So it has the effect of rewarding results that score high in at least one of the searches.",
      },
    ],
  },
];
