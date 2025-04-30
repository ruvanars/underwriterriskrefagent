const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
require('dotenv').config();

const openai = new OpenAIClient(
  process.env.OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.OPENAI_KEY)
);

async function embedText(text) {
  const result = await openai.getEmbeddings("text-embedding-ada-002", [text]);
  return result.data[0].embedding;
}

module.exports = { embedText };
