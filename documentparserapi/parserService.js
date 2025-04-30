const axios = require("axios");
require("dotenv").config();

const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;
const model = "prebuilt-document"; // or "layout", "invoice", or your custom model ID

async function analyzeDocument(buffer, contentType = "application/pdf") {
  const response = await axios.post(
    `${endpoint}/formrecognizer/documentModels/${model}:analyze?api-version=2023-07-31`,
    buffer,
    {
      headers: {
        "Content-Type": contentType,
        "Ocp-Apim-Subscription-Key": apiKey
      }
    }
  );

  const operationLocation = response.headers["operation-location"];
  let result;

  while (true) {
    const poll = await axios.get(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey }
    });
    result = poll.data;

    if (result.status === "succeeded") break;
    if (result.status === "failed") throw new Error("Analysis failed");
    await new Promise(r => setTimeout(r, 2000));
  }

  return result.documents || result.pages || result.keyValuePairs;
}

module.exports = { analyzeDocument };
