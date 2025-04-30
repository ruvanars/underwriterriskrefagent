const { sendToAzureOpenAI } = require('../services/azureOpenAI');

const handleFinalResponse = async (req, res) => {
  try {
    const { question, finaltext } = req.body;
    if (!question || !finaltext) {
      return res.status(400).json({ error: 'Missing question or finaltext' });
    }

    const answer = await sendToAzureOpenAI(question, finaltext);
    res.json({ answer });
  } catch (error) {
    console.error('[Final Response Error]', error.message);
    res.status(500).json({ error: 'Failed to generate final response' });
  }
};

module.exports = { handleFinalResponse };
