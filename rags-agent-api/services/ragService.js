const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const { OpenAIClient, AzureKeyCredential: OpenAIKey } = require("@azure/openai");
const { embedText } = require("./embedService");

const searchClient = new SearchClient(
  process.env.SEARCH_ENDPOINT,
  process.env.SEARCH_INDEX,
  new AzureKeyCredential(process.env.SEARCH_KEY)
);

const openai = new OpenAIClient(
  process.env.OPENAI_ENDPOINT,
  new OpenAIKey(process.env.OPENAI_KEY)
);

async function retrieveChunks(question) {
  const vector = await embedText(question);

  const results = await searchClient.search("", {
    vector: {
      value: vector,
      fields: "embedding",
      kNearestNeighborsCount: 5
    },
    top: 5
  });

  const chunks = [];
  for await (const item of results.results) {
    chunks.push(item.document.content);
  }

  return chunks;
}

async function askRagAgent(question) {
  const contextChunks = await retrieveChunks(question);

  const systemPrompt = `
You are an AI assistant for insurance underwriters. Use the following context to answer the question concisely and accurately.

Context:
${contextChunks.join("\n\n")}

Question: ${question}
`;

  const result = await openai.getChatCompletions("gpt-35-turbo", [
    { role: "system", content: "You are a helpful and accurate assistant." },
    { role: "user", content: systemPrompt }
  ]);

  return result.choices[0].message.content;
}

module.exports = { askRagAgent };
