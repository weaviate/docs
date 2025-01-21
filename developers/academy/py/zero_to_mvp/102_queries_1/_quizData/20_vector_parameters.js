export const nearVectorFunction = [{
    questionText: 'On what basis does the nearVector operator perform a search?',
    answerOptions: [
      {
        answerText: 'Similarity to a given text input',
        isCorrect: false,
        feedback: 'That would be nearText',
      },
      {
        answerText: 'Similarity to a provided vector',
        isCorrect: true,
        feedback: 'So if you have the query vector handy, nearVector is the operator to use.',
      },
      {
        answerText: 'Similarity to an existing Weaviate object',
        isCorrect: false,
        feedback: 'That would be nearObject',
      },
    ]
  }];