import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SolanaService } from './services/SolanaService';
import { HhiController } from './controllers/HhiController';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Add middleware
app.use(express.json());
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize services (Dependency Injection)
const solanaService = new SolanaService(HELIUS_API_KEY);
const hhiController = new HhiController(solanaService);

// Set up routes
app.get('/api/hhi', (req, res) => hhiController.getHHI(req, res));

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  if (!HELIUS_API_KEY) {
    console.warn('WARNING: Helius API key not set. Set HELIUS_API_KEY in .env file.');
  }
});