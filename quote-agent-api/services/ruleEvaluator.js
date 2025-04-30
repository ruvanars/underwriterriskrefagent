const axios = require("axios");
require("dotenv").config();

async function evaluateWithLogicApp(clauses) {
  const res = await axios.post(process.env.LOGIC_APP_URL, clauses);
  return res.data;
}

module.exports = { evaluateWithLogicApp };
