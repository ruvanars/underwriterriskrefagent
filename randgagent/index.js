const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { downloadBlobContent } = require('./blobService');
const { summarizeText } = require('./summarizer');
const { BlobServiceClient } = require('@azure/storage-blob');
const pdfParse = require('pdf-parse');
const { DefaultAzureCredential } = require('@azure/identity');
const { AzureOpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 7001;
const BLOB_ConnString = process.env.BLOB_ConnString;
const BLOB_ContainerName = process.env.BLOB_ContainerName;
const BLOB_BlobName = process.env.BLOB_BlobName;

async function readPdfFromBlob() {
    try {
        //console.log("I am inside readPdfFromBlob");
        const blobServiceClient = BlobServiceClient.fromConnectionString(BLOB_ConnString);
        const containerClient = blobServiceClient.getContainerClient(BLOB_ContainerName);
        const blobClient = containerClient.getBlobClient(BLOB_BlobName);
        //console.log("Blob URL: ", blobClient.url);
        const properties = await blobClient.getProperties();
        console.log("Expected blob size (bytes):", properties.contentLength);
  
        const downloadBlockBlobResponse = await blobClient.download();
        const buffer = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
        console.log("Downloaded buffer size (bytes):", buffer.length);
        //const parsed = await pdfParse(buffer);
        //const parsed = "await pdfParse(buffer)";
        const parsed = await pdfParse(buffer);
        console.log("Parsed PDF text size (characters):", parsed.text);
        return parsed.text;
    } catch (err) {
        console.error(`Error reading blob '${BLOB_BlobName}':`, err.message);
        throw err;
    }
  }
  function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => chunks.push(data instanceof Buffer ? data : Buffer.from(data)));
        readableStream.on("end", () => resolve(Buffer.concat(chunks)));
        readableStream.on("error", reject);
    });
  }

app.post('/summarize', async (req, res) => {
  //const { blobName } = req.body;
  console.log("I am in R&G agent");
  const text = await readPdfFromBlob();    
  console.log("Blaob text = " + text);
  try {
    // You will need to set these environment variables or edit the following values
    const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] || "https://policycopilotaiser.openai.azure.com/";  
    const apiVersion = "2025-01-01-preview";  
    const deployment = "DocumentSearchbasedeployment"; 
    const apiKey = process.env["AZURE_OPENAI_API_KEY"] || "EfhX9VFAQPe3C8RaL7i0A4uz2v8wga81fiUB5wV7GgbjURSKgi6TJQQJ99BDACYeBjFXJ3w3AAABACOG9Uya";  // This must match your deployment name
  
    // Initialize the DefaultAzureCredential
    const credential = new DefaultAzureCredential();
    const prompt = "can you give me the UW Referral, Mechanical RRL,Net & Treaty Premium,Referral to sign off by numbers from table and summary of Mechanical RRL?";
    // Initialize the AzureOpenAI client with Entra ID (Azure AD) authentication
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });  
  
    const result = await client.chat.completions.create({  
    messages: [  
      //{ role: "system", content: "You are an AI assistant that helps people find information." },
       { role: "user", content: `${prompt}\n\n${text}` }
       
    ],  
    max_tokens: 800,  
    temperature: 0.7,  
    top_p: 0.95,  
    frequency_penalty: 0,  
    presence_penalty: 0,  
    stop: null  
    });  
    console.log("Result from Azure OpenAI:", result);
    const answer = result.choices[0].message.content.trim();
    console.log("Answer from Azure OpenAI:", answer);
    res.json({ answer });

    } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send({ error: 'An error occurred during summarization.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('R&G API is running!');
  });
