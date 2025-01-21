export const apiRecap = [{
    questionText: 'Which of the following is not true about the Weaviate API?',
    answerOptions: [
      {
        answerText: 'Weaviate users can use both REST and GraphQL.',
        isCorrect: false,
        feedback: 'They are both available for all users, and serve complementary roles in communicating with Weaviate.',
      },
      {
        answerText: 'The REST API can be used to retrieve instance configuration data.',
        isCorrect: false,
        feedback: 'the `meta` endpoint is available for this purpose.',
      },
      {
        answerText: 'Both GraphQL and REST APIs can be used in Weaviate to perform vector searches.',
        isCorrect: true,
        feedback: 'Only the GraphQL API performs vector searches.',
      },
      {
        answerText: 'None of the above.',
        isCorrect: false,
        feedback: 'The truth is out there!',
      },
    ]
  }];
export const clientLimits = [{
    questionText: 'What can\'t Weaviate clients do?',
    answerOptions: [
      {
        answerText: 'Analyze the retrieved results.',
        isCorrect: true,
        feedback: 'They cannot perform any data analysis.',
      },
      {
        answerText: 'Communicate with the Weaviate REST API.',
        isCorrect: false,
        feedback: 'They can all perform REST API requests.',
      },
      {
        answerText: 'Communicate with the Weaviate GraphQL API.',
        isCorrect: false,
        feedback: 'They can all perform GraphQL API requests.',
      },
    ]
  }];
  