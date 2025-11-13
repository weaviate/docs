exports.handler = async (event) => {
  const allowedOriginPattern = process.env.ALLOWED_ORIGIN || '*';
  const requestOrigin = event.headers.origin;

  const isAllowed = () => {
    if (allowedOriginPattern === '*') {
      return true;
    }
    if (!requestOrigin) {
      return false;
    }
    if (requestOrigin === allowedOriginPattern) {
      return true;
    }
    if (allowedOriginPattern.startsWith('*.')) {
      const baseDomain = allowedOriginPattern.substring(1);
      const requestHostname = new URL(requestOrigin).hostname;
      return requestHostname.endsWith(baseDomain);
    }
    return false;
  };

  if (!isAllowed()) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Origin not allowed' }),
      headers: {
        'Access-Control-Allow-Origin': allowedOriginPattern === '*'
          ? '*'
          : allowedOriginPattern,
      },
    };
  }

  const accessControlOrigin = allowedOriginPattern.startsWith('*.')
    ? requestOrigin
    : allowedOriginPattern;

  const headers = {
    'Access-Control-Allow-Origin': accessControlOrigin,
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
    if (!data.page || typeof data.isPositive !== 'boolean') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: page and isPositive.',
        }),
        headers,
      };
    }

    if (!WEAVIATE_DOCFEEDBACK_URL || !WEAVIATE_DOCFEEDBACK_API_KEY) {
      console.error('Missing Weaviate environment variables.', {
        hasUrl: !!WEAVIATE_DOCFEEDBACK_URL,
        hasKey: !!WEAVIATE_DOCFEEDBACK_API_KEY,
        context: process.env.CONTEXT,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('WEAVIATE')),
      });
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Server configuration error.',
          debug: {
            hasUrl: !!WEAVIATE_DOCFEEDBACK_URL,
            hasKey: !!WEAVIATE_DOCFEEDBACK_API_KEY,
            context: process.env.CONTEXT,
            availableWeaviateVars: Object.keys(process.env).filter(k => k.includes('WEAVIATE')),
          },
        }),
        headers,
      };
    }

    const weaviatePayload = {
      class: 'DocFeedback',
      properties: {
        page: data.page,
        isPositive: data.isPositive,
        // The frontend sends an array of option indexes as integers
        options: data.options || [],
        // The frontend can send 'comment' (singular).
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
      let errorBody;
      try {
        errorBody = await response.json();
      } catch (jsonError) {
        // If response is not JSON, get it as text
        try {
          errorBody = await response.text();
        } catch (textError) {
          errorBody = 'Unable to parse error response';
        }
      }
      console.error('Failed to send data to Weaviate:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'Failed to store feedback.',
          debug: {
            weaviateStatus: response.status,
            weaviateStatusText: response.statusText,
            weaviateUrl: WEAVIATE_DOCFEEDBACK_URL,
            // TODO: Remove errorBody from production after debugging
            weaviateError: errorBody,
            timestamp: new Date().toISOString(),
            context: process.env.CONTEXT,
          },
        }),
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
        debug: {
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
          // TODO: Remove stack trace from production after debugging
          stack: error.stack,
          context: process.env.CONTEXT,
        },
      }),
      headers,
    };
  }
};
