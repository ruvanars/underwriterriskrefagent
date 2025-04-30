const express = require("express");
const multer = require("multer");
const { uploadFile } = require("./blobService");

const app = express();
const upload = multer();

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const containerName = "documents";
    const blobUrl = await uploadFile(containerName, file.originalname, file.buffer);

    res.status(200).send({ message: "Uploaded successfully", url: blobUrl });
  } catch (error) {
    console.error("Upload failed", error);
    res.status(500).send({ error: "Upload failed" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Document Upload API listening on port ${PORT}`));
