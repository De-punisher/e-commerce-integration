const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend'));

// Routes
app.use('/api/payments', require('./routes/payments'));
app.use('/api/products', require('./routes/products'));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../frontend' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});