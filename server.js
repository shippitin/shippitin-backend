const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS so frontend can call this API
app.use(cors());

// API endpoint: GET /api/track/:id
app.get('/api/track/:id', (req, res) => {
  const id = req.params.id.toUpperCase();
  const dataPath = path.join(__dirname, 'shipments.json');

  fs.readFile(dataPath, 'utf8', (err, json) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    const shipments = JSON.parse(json);
    const result = shipments[id];

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'No tracking data found for this ID' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});