// This is a Netlify Function that securely provides the API key to the frontend.
// The API_KEY is stored as an environment variable in the Netlify dashboard.
exports.handler = async function(event, context) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API_KEY is not configured on the server." }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey: apiKey }),
  };
};
