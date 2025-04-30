require('dotenv').config();
const express = require('express');
const app = express();
const finalResponseRoute = require('./routes/finalresponse');
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use('/api/finalresponse', finalResponseRoute);
const PORT = process.env.PORT || 6020;
app.listen(PORT, () => {
  console.log(`Final Response Agent running on http://localhost:${PORT}`);
});
