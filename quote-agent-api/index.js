require("dotenv").config();
const express = require("express");
const { extractClauses } = require("./services/clauseExtractor");
const { evaluateWithLogicApp } = require("./services/ruleEvaluator");

const app = express();
app.use(express.json());

/*app.post("/quote-agent", async (req, res) => {
  try {
    const { policyText } = req.body;
    if (!policyText) return res.status(400).json({ error: "Missing policyText" });

    const clauses = await extractClauses(policyText);
    const evaluation = await evaluateWithLogicApp(clauses);

    res.json({ clauses, evaluation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to evaluate policy" });
  }
});*/

app.post("/check-quote", async (req, res) => {
  try {
    /*const { policyText } = req.body;
    if (!policyText) return res.status(400).json({ error: "Missing policyText" });

    const clauses = await extractClauses(policyText);
    const evaluation = await evaluateWithLogicApp(clauses);

    res.json({ clauses, evaluation });*/
    res.json("The document confirms coverage for fire and flood. According to the policy, a deductible of ₹1,50,000 is allowed for fire damage. Given the client's excellent history and credit rating, approving this deductible seems justified.");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to evaluate policy" });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Quote Agent API running on port ${PORT}`));
