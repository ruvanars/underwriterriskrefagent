const axios = require('axios');
const { AzureOpenAI } = require("openai"); 
const { DefaultAzureCredential } = require('@azure/identity');
const AZURE_OPENAI_ENDPOINT1 = process.env.AZURE_OPENAI_ENDPOINT; // e.g., https://your-resource.openai.azure.com
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT;
async function GetFinalAnserFromOpenAI(prompt, pdfText) {   

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
  

async function sendToAzureOpenAI(question, finaltext) {
  
    try {
        console.log(" I am in getfinalresponse");
    
        //console.log(req.body);
       // const { question, finaltext } = req.body;
        console.log("req.body.question", question);
        console.log("Final Text", finaltext);
    
        //const text = await readPdfFromBlob();    
        
        
        const answer = await GetFinalAnserFromOpenAI(question, finaltext);
        console.log("Answer from Azure OpenAI :", answer);
    
        return answer;
        //res.json( req.body )
      }
      catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).send('Failed to process request');
      }

  
}

module.exports = { sendToAzureOpenAI };
