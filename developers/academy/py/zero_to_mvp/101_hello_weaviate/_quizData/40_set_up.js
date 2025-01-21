export const instanceOptions = [{
    questionText: 'Which of the following is not true?',
    answerOptions: [
      {
        answerText: 'We recommend using WCD for Weaviate Academy.',
        isCorrect: false,
        feedback: 'WCD *is* our recommended option for running Weaviate.',
      },
      {
        answerText: 'The newest versions of Weaviate are available for WCD and locally hosted instances.',
        isCorrect: false,
        feedback: 'You can run the latest version of Weaviate anywhere, on Docker/Kubernetes or WCD.',
      },
      {
        answerText: 'This unit will cover Docker/Kubernetes deployment.',
        isCorrect: true,
        feedback: 'That topic will be discussed in a later unit.',
      },
    ]
  }];
export const wcdSetup = [{
    questionText: 'Which of the following is necessary to configure a Weaviate instance for Weaviate Academy exercises?',
    answerOptions: [
      {
        answerText: 'A paid instance of WCD.',
        isCorrect: false,
        feedback: 'A free (sandbox) tier is sufficient for Weaviate Academy.',
      },
      {
        answerText: 'OpenID Connect (OIDC) authentication.',
        isCorrect: false,
        feedback: 'You are welcome to use OIDC, but it is not necessary.',
      },
      {
        answerText: 'A self-hosted Docker or Kubernetes instance.',
        isCorrect: false,
        feedback: 'You are welcome to use a self-hosted instance, but it is not necessary.',
      },
      {
        answerText: 'None of the above are necessary.',
        isCorrect: true,
        feedback: 'Looks like you are ready to move on 😊.',
      },
    ]
  }];
export const clientCapabilities = [{
    questionText: 'Which of the following is not true about Weaviate clients?',
    answerOptions: [
      {
        answerText: 'Weaviate clients are available for Python, TypeScript/JavaScript, Go and Java.',
        isCorrect: false,
        feedback: 'Clients are currently available for each of these languages.',
      },
      {
        answerText: 'There is only a small subset of GraphQL queries that Weaviate clients cannot perform.',
        isCorrect: false,
        feedback: 'These clients can perform all RESTful and GraphQL requests.',
      },
      {
        answerText: 'Weaviate clients come bundled with Weaviate.',
        isCorrect: true,
        feedback: 'The appropriate client must be installed separately for each language.',
      },
    ]
  }];
  