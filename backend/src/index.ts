import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { setupRoutes } from './routes';
import { setupSocket } from './socket';
import { createTables } from './database/migrate';
import path from 'path';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize database tables
createTables();

// Handle proxy headers for HTTPS detection
app.set('trust proxy', true);

// Middleware - disable upgrade-insecure-requests completely
app.use(helmet({
  hsts: {
    maxAge: 0,
    includeSubDomains: false,
    preload: false
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    }
  },
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  originAgentCluster: false,
}));

// Override CSP header to remove upgrade-insecure-requests which causes HTTPS redirection
app.use((req, res, next) => {
  // Get the CSP header that Helmet set
  let cspHeader = res.getHeader('Content-Security-Policy') as string;
  if (cspHeader && cspHeader.includes('upgrade-insecure-requests')) {
    // Remove upgrade-insecure-requests from CSP
    cspHeader = cspHeader.replace('upgrade-insecure-requests;', '').trim();
    cspHeader = cspHeader.replace('upgrade-insecure-requests', '').trim();
    res.setHeader('Content-Security-Policy', cspHeader);
  }
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL === '*' ? '*' : (process.env.FRONTEND_URL || 'http://localhost:3000'),
  credentials: true // Allow credentials to be sent
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Serve static files from frontend build - path will be relative to dist directory when compiled
app.use(express.static(path.join(__dirname, 'frontend-dist')));

// Routes
setupRoutes(app);

// For all other routes, return the frontend index.html
// This allows React Router to handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend-dist', 'index.html'));
});

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL === '*' ? '*' : (process.env.FRONTEND_URL || 'http://localhost:3000'),
  },
  transports: ['websocket', 'polling'], // Enable both websocket and polling
  allowEIO3: true // Allow Engine.IO v3 (newer version)
});

// Handle proxy headers for HTTPS detection
app.set('trust proxy', true); // Trust the proxy that's forwarding requests

server.on('upgrade', (req, socket, head) => {
  // Set secure connection if coming through HTTPS reverse proxy
  if (req.headers['x-forwarded-proto'] === 'https') {
    (req as any).connection.encrypted = true;
    (req as any).protocol = 'https';
    (req as any).secure = true;
  }
});

setupSocket(io);

const PORT = parseInt(process.env.PORT || '5680', 10);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});