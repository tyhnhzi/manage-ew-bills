
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
connectDB();

const app = express();

app.use(cors());          
app.use(express.json());  

app.post('/test', (req, res) => {
    res.json({ message: "Test route is working!" });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.get('/', (req, res) => {
  res.send('API is running...');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));