require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { ingestBuffer } = require('./services/ingestService');
const { askRagAgent } = require('./services/ragService');

const app = express();
const upload = multer();
app.use(express.json());

app.post('/ingest', upload.single("file"), async (req, res) => {
  try {
    const result = await ingestBuffer(req.file.buffer, req.file.originalname);
    res.json({ success: true, message: "Document ingested", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await askRagAgent(question);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`R&Gs Agent API running on port ${PORT}`));
