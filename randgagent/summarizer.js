const axios = require('axios');
require('dotenv').config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

async function summarizeText(text) {
  try {
    const url = `${endpoint}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

    const response = await axios.post(
      url,
      {
        messages: [
          { role: "system", content: "You are a helpful assistant that summarizes insurance policy documents in simple language." },
          { role: "user", content: `Summarize this document:\n\n${text}` }
        ],
        temperature: 0.3,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { summarizeText };
