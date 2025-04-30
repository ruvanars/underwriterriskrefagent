require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

const { handleLLMQuery } = require("./llmCore");

app.post("/query", async (req, res) => {
  try {
    const userQuery = req.body.query;
    const agent = req.body.agent || "default";
    const result = await handleLLMQuery(userQuery, agent);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("LLM Core running on port 3000"));
