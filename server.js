const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the out directory
app.use('/', express.static(path.join(__dirname, 'out')));

// Handle all routes by serving index.html from the out directory
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'out/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
