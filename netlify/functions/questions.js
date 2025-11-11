// Netlify Function to handle questions API
// Note: This uses in-memory storage. For persistent storage, consider using a database service.

let questionsData = { questions: [], revealed: [] };

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // GET request - retrieve questions
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(questionsData),
      };
    }

    // POST request - save questions
    if (event.httpMethod === 'POST') {
      const { questions, revealed } = JSON.parse(event.body);
      
      if (!Array.isArray(questions) || !Array.isArray(revealed)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid data format' }),
        };
      }

      questionsData = { questions, revealed };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

