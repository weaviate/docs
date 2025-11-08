exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*', // This should be locked down in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight CORS request for browser compatibility
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // We only want to handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
      headers,
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { WEAVIATE_DOCFEEDBACK_URL, WEAVIATE_DOCFEEDBACK_API_KEY } =
      process.env;

    // Basic server-side validation
    if (!data.page || !data.vote) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: page and vote.',
        }),
        headers,
      };
    }

    if (!WEAVIATE_DOCFEEDBACK_URL || !WEAVIATE_DOCFEEDBACK_API_KEY) {
      console.error('Missing Weaviate environment variables.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error.' }),
        headers,
      };
    }

    const weaviatePayload = {
      class: 'DocFeedback',
      properties: {
        page: data.page,
        vote: data.vote,
        // The frontend sends an array of 'options'. Join it into a string.
        feedbackType: data.options ? data.options.join(', ') : undefined,
        // The frontend sends 'comment' (singular).
        comments: data.comment,
        timestamp: new Date().toISOString(),
        testData: data.testData, // Add the testData flag
        hostname: data.hostname, // Add the hostname
      },
    };

    const weaviateUrl = `${WEAVIATE_DOCFEEDBACK_URL}/v1/objects`;

    const response = await fetch(weaviateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WEAVIATE_DOCFEEDBACK_API_KEY}`,
      },
      body: JSON.stringify(weaviatePayload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Failed to send data to Weaviate:', errorBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to store feedback.' }),
        headers,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Feedback received and stored.' }),
      headers,
    };
  } catch (error) {
    console.error('Error processing feedback:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'There was an error processing your feedback.',
      }),
      headers,
    };
  }
};
