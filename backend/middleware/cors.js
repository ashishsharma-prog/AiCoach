const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://localhost:5174',
    'https://mindful-imagination-production.up.railway.app',
    'https://ai-coach-jet.vercel.app'  // Add this line
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);