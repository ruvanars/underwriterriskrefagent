require('dotenv').config();
const express = require('express');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const { PDFDocument } = require('pdf-lib');
const { AzureOpenAI } = require("openai");  

const app = express();
app.use(express.json());
app.use(cors());
/*
async function parsePdfWithPdfLib(buffer) {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    const text = pages.map(page => page.getTextContent()).join('\n');
    return text;
  } catch (error) {
    console.error("Error parsing PDF with pdf-lib:", error.message);
    throw new Error("Failed to parse PDF with pdf-lib.");
  }
}
async function downloadPdfText() {
  const BLOB_URL = process.env.BLOB_URL;
  console.log("I am before calling API");
  const response = await axios.get(BLOB_URL, { responseType: 'arraybuffer' });
  console.log("Response headers:", response.headers);
  console.log("Response data (as string):", response.data.toString());
  const text = await parsePdfWithPdfLib(response.data);
  console.log("Parsed PDF text:", text);
  console.log("PDF file saved as downloaded.pdf");
  const contentType = response.headers['content-type'];
  if (!contentType || !contentType.includes('application/pdf')) {
    throw new Error(`Invalid content type: ${contentType}`);
  }
  console.log('Downloaded content type:', contentType); // Should be application/pdf

  if (!contentType.includes('pdf')) {
    throw new Error(`Expected PDF, got: ${contentType}`);
  }
  console.log("Response headers:", response.headers);
  //console.log("Response data (buffer):", response.data);
  try {
    const data = await pdfParse(response.data);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error.message);
    throw new Error("Failed to parse PDF. The file might be corrupted or invalid.");
  }
  console.log("pdf Data " + data);
  return data.text;
}

/*async function askOpenAI(documentText, question) {
  const prompt = `Document:\n${documentText}\n\nQuestion: ${question}`;``
  
  const response = await axios.post(
    `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
    {
      messages: [
        { role: "system", content: "You are a policy document assistant. Only answer based on the provided document." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 500
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY
      }
    }
  );

  return response.data.choices[0].message.content;
}*/

const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const BLOB_ConnString = process.env.BLOB_ConnString;
const BLOB_ContainerName = process.env.BLOB_ContainerName;
const BLOB_BlobName = process.env.BLOB_BlobName;

async function readPdfFromBlob() {
  try {
      console.log("I am inside readPdfFromBlob");
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
      //console.log("Parsed PDF text size (characters):", parsed.text);
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


const AZURE_OPENAI_ENDPOINT1 = process.env.AZURE_OPENAI_ENDPOINT; // e.g., https://your-resource.openai.azure.com
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT; // e.g., 'gpt-35-turbo'
async function sendToAzureOpenAI(prompt, pdfText) {   

  // You will need to set these environment variables or edit the following values
  const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] || "https://policycopilotaiser.openai.azure.com/";  
  const apiVersion = "2025-01-01-preview";  
  const deployment = "DocumentSearchbasedeployment"; 
  const apiKey = process.env["AZURE_OPENAI_API_KEY"] || "EfhX9VFAQPe3C8RaL7i0A4uz2v8wga81fiUB5wV7GgbjURSKgi6TJQQJ99BDACYeBjFXJ3w3AAABACOG9Uya";  // This must match your deployment name
  
  // Initialize the DefaultAzureCredential
  const credential = new DefaultAzureCredential();  
  
  // Initialize the AzureOpenAI client with Entra ID (Azure AD) authentication
  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });  
  
  const result = await client.chat.completions.create({  
    messages: [  
      //{ role: "system", content: "You are an AI assistant that helps people find information." },
       { role: "user", content: `${prompt}\n\n${pdfText}` }
       
    ],  
    max_tokens: 800,  
    temperature: 0.7,  
    top_p: 0.95,  
    frequency_penalty: 0,  
    presence_penalty: 0,  
    stop: null  
  });  
  
  const answer = result.choices[0].message.content.trim();
  console.log("Answer from Azure OpenAI:", answer);
  return answer;

}


app.get('/', (req, res) => {
  res.send('Policy Agent API is running!');
});

app.post('/askpolicy', async (req, res) => {
  try {
    const { question } = req.body;
    //const answer = question;
    const text = await readPdfFromBlob();    
    //console.log("Readed test :" + text.toString());
    
    const answer = await sendToAzureOpenAI(question, text);
    //console.log("Answer from Azure OpenAI:", answer);
    res.json({ answer });
  }
  catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).send('Failed to process request');
  }
});

/*app.post('/getfirelinamount', async (req, res) => {
  try {
    const { question } = req.body;
    console.log(" I am in getfirelinamount");
    //const answer = question;
    const text = await readPdfFromBlob();    
    
    
    const answer = await sendToAzureOpenAI(question, text);
    console.log("Answer from Azure OpenAI getfirelinamount:", answer);

    res.json({ answer });
  }
  catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).send('Failed to process request');
  }
});*/

app.post('/getfinalresponse', async (req, res) => {
  try {
    console.log(" I am in getfinalresponse");

    //console.log(req.body);
    const { question, finaltext } = req.body;
    console.log("req.body.question", question);
    console.log("Final Text", finaltext);

    //const text = await readPdfFromBlob();    
    
    
    const answer = await sendToAzureOpenAI(question, finaltext);
    console.log("Answer from Azure OpenAI getflooddamage:", answer);

    res.json({ answer });
    //res.json( req.body )
  }
  catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).send('Failed to process request');
  }
});

app.listen(4020, () => {
  console.log('Server running on http://localhost:4020');
});
