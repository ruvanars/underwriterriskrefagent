const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
require("dotenv").config();

/*const client = new OpenAIClient(
  process.env.OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.OPENAI_KEY)
);*/

async function extractClauses(policyText) {
  const prompt = `
Extract the following clauses from the given insurance policy and respond with JSON:

{
  "FloodCoverage": true/false,
  "TerrorismCoverage": true/false,
  "DeductibleClause": "<value or null>"
}

Policy:
"""${policyText}"""
`;

  const response = await client.getChatCompletions("gpt-35-turbo", [
    { role: "system", content: "You are an insurance clause extraction agent." },
    { role: "user", content: prompt }
  ]);

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    console.error("Could not parse response:", content);
    throw new Error("Invalid response from GPT");
  }
}

module.exports = { extractClauses };
