export const howWeaviateWorks = [{
    questionText: 'Which of these statements are true?',
    answerOptions: [
      {
        answerText: 'Weaviate has no way of quantifying similarity between objects.',
        isCorrect: false,
        feedback: 'Weaviate performs vector searches, which is similarity-based.',
      },
      {
        answerText: 'The only type of index in Weaviate is the vector index.',
        isCorrect: false,
        feedback: 'In addition to the vector index, Weaviate uses an inverted index.',
      },
      {
        answerText: 'Weaviate is a machine learning model.',
        isCorrect: false,
        feedback: 'While Weaviate can be used with a variety of different models which help it determine object similarity, it is itself not a machine learning model. Weaviate is a vector database.',
      },
      {
        answerText: 'None of the above',
        isCorrect: true,
        feedback: 'All of these are false!',
      },
    ]
  }];
  