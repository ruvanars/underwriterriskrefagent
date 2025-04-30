const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
);

async function handleLLMQuery(query, agent = "default") {
  const context = await retrieveContext(query);
  const prompt = await buildPrompt(query, context, agent);
  const completion = await getLLMCompletion(prompt);
  return { query, context, response: completion };
}

async function buildPrompt(query, context, agent) {
  const templatePath = path.join(__dirname, "prompts", `${agent}.txt`);
  const template = fs.readFileSync(templatePath, "utf-8");
  return template
    .replace("{{query}}", query)
    .replace("{{context}}", context);
}

async function retrieveContext(query) {
  const res = await axios.post(
    `${process.env.AZURE_SEARCH_ENDPOINT}/indexes/${process.env.AZURE_SEARCH_INDEX}/docs/search?api-version=2023-07-01-preview`,
    {
      search: query,
      top: 3,
      vector: [], // optional vector embedding
      semanticConfiguration: "default"
    },
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_SEARCH_KEY
      }
    }
  );

  return res.data.value.map(doc => doc.content).join("\n---\n");
}

async function getLLMCompletion(prompt) {
  const res = await client.getChatCompletions(process.env.AZURE_OPENAI_DEPLOYMENT, [
    { role: "system", content: "You're an expert underwriting assistant." },
    { role: "user", content: prompt }
  ]);
  return res.choices[0].message.content;
}

module.exports = { handleLLMQuery };
