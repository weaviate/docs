const invertedIndex = [
    {
    questionText: 'What is the function of an inverted index in Weaviate?',
    answerOptions: [
    {
    answerText: 'It allows for efficient retrieval of vectors based on similarity.',
    isCorrect: false,
    feedback: 'That is the function of the vector index.',
    },
    {
    answerText: 'It deconstructs text into a set of constituent terms and stores them for fast retrieval.',
    isCorrect: true,
    feedback: 'This allows objects containing those terms to be retrieved quickly.',
    },
    {
    answerText: 'It acts as a blueprint for your data.',
    isCorrect: false,
    feedback: 'That is the function of the schema.',
    },
    ]
    }];
    const vectorIndex = [
    {
    questionText: 'What does the vector index in Weaviate enable?',
    answerOptions: [
    {
    answerText: 'It enables efficient retrieval of data based on a reference table.',
    isCorrect: false,
    feedback: 'That is the function of the inverted index, not the vector index.',
    },
    {
    answerText: 'It enables similarity searches by associating each object with a vector.',
    isCorrect: true,
    feedback: 'Correct! The vector index uses an Approximate Nearest Neighbor (ANN) algorithm to allow fast similarity searches.',
    },
    {
    answerText: 'It defines the data structure of Weaviate.',
    isCorrect: false,
    feedback: 'That is the function of the schema, not the vector index.',
    },
    ]
    }];
    const classDefinition = [
    {
    questionText: 'What is a class in Weaviate?',
    answerOptions: [
    {
    answerText: 'It is a type of index used for efficient data retrieval.',
    isCorrect: false,
    feedback: 'A class is not a type of index. It is a collection of objects of the same type in Weaviate.',
    },
    {
    answerText: 'It is a collection of objects of the same type.',
    isCorrect: true,
    feedback: 'Correct! A class in Weaviate is a collection of objects of the same type.',
    },
    {
    answerText: 'It is a specific object within a collection.',
    isCorrect: false,
    feedback: 'A class is not a specific object, but rather a collection of objects of the same type.',
    },
    ]
    }];
    const schemaRole = [
    {
    questionText: 'What is the function of the schema in Weaviate?',
    answerOptions: [
    {
    answerText: 'It allows for efficient retrieval of vectors based on similarity.',
    isCorrect: false,
    feedback: 'That is the function of the vector index, not the schema.',
    },
    {
    answerText: 'It deconstructs text into a set of constituent terms and stores them in a data structure.',
    isCorrect: false,
    feedback: 'That is the function of the inverted index, not the schema.',
    },
    {
    answerText: 'It acts as a blueprint that defines the data structure of Weaviate.',
    isCorrect: true,
    feedback: 'The schema defines the data structure for each class of objects in Weaviate.',
    },
    ]
    },
    ]
    