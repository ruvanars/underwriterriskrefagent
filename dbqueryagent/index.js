const express = require("express");
const cors = require('cors');
const checkRoute = require("./routes/checkRoute");

const app = express();
const PORT = 5001;
app.use(express.json()); 
app.use(cors());
app.use(express.json());
app.use("/api", checkRoute);

app.listen(PORT, () => {
  console.log(`Deductible Check API running on http://localhost:${PORT}`);
});
