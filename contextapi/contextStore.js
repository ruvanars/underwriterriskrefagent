const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const databaseId = "UnderwriterContext";
const containerId = "SessionState";

const client = new CosmosClient({ endpoint, key });
const container = client.database(databaseId).container(containerId);

async function saveSession(sessionId, data) {
  const item = { id: sessionId, sessionId, ...data };
  await container.items.upsert(item);
  return item;
}

async function getSession(sessionId) {
  const { resource } = await container.item(sessionId, sessionId).read();
  return resource;
}

module.exports = { saveSession, getSession };
