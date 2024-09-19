const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes

app.get("/file/:filename", async (req, res) => {
  const { filename } = req.params;
  console.log(`another request: ${filename}`);
  const filePath = path.join(__dirname, filename);

  try {
    const data = await fs.readFile(filePath, "utf8");
    res.send(data);
  } catch (error) {
    res.status(404).send(`File not found: ${filename}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
