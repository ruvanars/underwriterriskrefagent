const axios = require('axios');
require('dotenv').config();

module.exports = async function (context, req) {
    const userInput = req.body.userQuery;

    try {
        // 🔁 Call all sub-agents (parallel or sequential)
        const [docRes, policyRes, dbRes] = await Promise.all([
            axios.post(process.env.DOCUMENT_AGENT_URL, { userQuery: userInput }),
            axios.post(process.env.POLICY_AGENT_URL, { userQuery: userInput }),
            axios.post(process.env.DB_AGENT_URL, { userQuery: userInput })
        ]);

        // 📦 Combine agent responses
        const combinedAgentOutputs = {
            documentAgentOutput: docRes.data.result,
            policyAgentOutput: policyRes.data.result,
            dbAgentOutput: dbRes.data.result
        };

        // 🧠 Send to final response agent
        const response = await axios.post(process.env.RESPONSE_AGENT_URL, combinedAgentOutputs);

        context.res = {
            status: 200,
            body: {
                finalResponse: response.data.finalExplanation
            }
        };

    } catch (err) {
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};
