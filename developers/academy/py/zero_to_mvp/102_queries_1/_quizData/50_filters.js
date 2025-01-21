export const whereUsage = [{
    questionText: 'Which filter is used to apply a boolean condition to the data in Weaviate?',
    answerOptions: [
      {
        answerText: 'limit',
        isCorrect: false,
        feedback: 'This is used to set the maximum number of objects to retrieve.',
      },
      {
        answerText: 'offset',
        isCorrect: false,
        feedback: 'This is used to skip a number of results.',
      },
      {
        answerText: 'where',
        isCorrect: true,
        feedback: 'It is similar to the WHERE clause in SQL.',
      },
    ]
  }];
export const offsetExample = [{
    questionText: 'How can you combine the offset and limit operators to display the second page of results with 10 results per page?',
    answerOptions: [
      {
        answerText: 'Set offset: 10 and limit: 10',
        isCorrect: true,
        feedback: 'This would get results 11-20.',
      },
      {
        answerText: 'Set offset: 20 and limit: 10',
        isCorrect: false,
        feedback: 'This would get results 21-30.',
      },
      {
        answerText: 'Set offset: 10 and limit: 20',
        isCorrect: false,
        feedback: 'This would get results 11-30',
      },
    ]
  }];