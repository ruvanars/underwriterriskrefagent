const express = require("express");
const { saveSession, getSession } = require("./contextStore");
const app = express();
app.use(express.json());

app.post("/context/save", async (req, res) => {
  const { sessionId, data } = req.body;
  try {
    const result = await saveSession(sessionId, data);
    res.status(200).json({ message: "Saved", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/context/:sessionId", async (req, res) => {
  try {
    const context = await getSession(req.params.sessionId);
    res.status(200).json(context);
  } catch (err) {
    res.status(404).json({ error: "Session not found" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Context API running on port ${PORT}`));
