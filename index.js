const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the entire project directory.
// This allows accessing /login/index.html and /public/assets etc.
app.use(express.static(__dirname));

// After the static middleware, add a catch-all for any GET request
// that didn't find a file. This is for handling client-side routing on refresh.
// We use a regular expression to avoid issues with path string parsing.
app.get(/.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});