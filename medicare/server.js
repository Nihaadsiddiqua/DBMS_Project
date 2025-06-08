const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the frontend directory
app.use(express.static('frontend'));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});