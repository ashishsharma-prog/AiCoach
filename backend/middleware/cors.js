const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ai-coach-jet.vercel.app',
  'http://agile-spirit-production.up.railway.app',
  'https://agile-spirit-production.up.railway.app',
  'https://aicoach-production-d965.up.railway.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
    callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent', 'Referer']
};

module.exports = cors(corsOptions);