const fs = require("fs");
const path = require("path");
const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const { embedText } = require("./embedService");

const searchClient = new SearchClient(
  process.env.SEARCH_ENDPOINT,
  process.env.SEARCH_INDEX,
  new AzureKeyCredential(process.env.SEARCH_KEY)
);

async function ingestBuffer(buffer, originalName) {
  const text = buffer.toString("utf-8");
  const chunks = text.match(/.{1,1000}/gs);
  const documents = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = await embedText(chunk);

    documents.push({
      id: `${originalName}-${i}`,
      content: chunk,
      embedding: vector,
      source: originalName
    });
  }

  return await searchClient.uploadDocuments(documents);
}

module.exports = { ingestBuffer };
