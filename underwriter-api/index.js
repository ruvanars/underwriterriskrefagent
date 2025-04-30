// index.js
const express = require('express');
const cors = require('cors');
const axios = require("axios");
const { Console } = require('console');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/query', async (req, res) => {
  const { question } = req.body;
   console.log("I am calling API" + question);
  //const response = await axios.post( "http://localhost:7071/api/RouterFunction", { question });
  const response = await axios.post("http://localhost:4020/askpolicy", { question });
  res.send(response.data);
});

app.post('/checkcoveragelimit', async (req, res) => { 
  console.log("Incoming body:", req.body);
  // DB call for max amount
  const response = await axios.post("http://localhost:5001/api/checkcoveragelimitfromdb",  req.body );  
  console.log("Response from checkcoveragelimit API:", JSON.stringify(response.data.Coveragelimit));
  // Next prompt for policy agent
  const question = "Check the maximum limit for this policy of exceeds " + response.data.Coveragelimit + " and give me the answer in yes or no";
  // Call to policy agent with prompt
  const responsefromapi = await axios.post("http://localhost:4020/askpolicy", { question });
  var responseforlimit = "";
  if (responsefromapi.data.answer === "No") {
    responseforlimit = "The maximum limit for this policy exceeds " + response.data.Coveragelimit + " and the answer is Yes referral is required";
  }
  else {
    responseforlimit = "The maximum limit for this policy does not exceed " + response.data.Coveragelimit + " and the answer is NO referral is not required";
  }
  //console.log("Response from checkcoveragelimit API:", JSON.stringify(responseforlimit));
  res.send("Response from Database agent for check coverage limit  "+ JSON.stringify(responseforlimit));
});

app.post('/checkquestions', async (req, res) => { 
  console.log("Incoming body:", req.body);
  const response = await axios.post("http://localhost:5001/api/checkquestions",  req.body );  
  console.log(JSON.stringify(response.data)); 
  return res.json(response.data);
});

app.post('/checkban', async (req, res) => { 
  console.log("Incoming body:", req.body);
  const response = await axios.post("http://localhost:5001/api/checkban",  req.body );   
  return res.json(response.data);
});

app.get('/', (req, res) => {
  res.send('Underwriter API is running!');
  
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
