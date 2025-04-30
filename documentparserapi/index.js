const express = require("express");
const multer = require("multer");
const { analyzeDocument } = require("./parserService");
require("dotenv").config();

const app = express();
const upload = multer();

app.post("/parse", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded");

    const result = await analyzeDocument(file.buffer, file.mimetype);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Parsing error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Document Parser API running on port ${PORT}`));
