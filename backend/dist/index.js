"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const routes_1 = require("./routes");
const socket_1 = require("./socket");
const migrate_1 = require("./database/migrate");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
(0, migrate_1.createTables)();
app.set('trust proxy', true);
app.use((0, helmet_1.default)({
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
app.use((req, res, next) => {
    let cspHeader = res.getHeader('Content-Security-Policy');
    if (cspHeader && cspHeader.includes('upgrade-insecure-requests')) {
        cspHeader = cspHeader.replace('upgrade-insecure-requests;', '').trim();
        cspHeader = cspHeader.replace('upgrade-insecure-requests', '').trim();
        res.setHeader('Content-Security-Policy', cspHeader);
    }
    next();
});
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL === '*' ? '*' : (process.env.FRONTEND_URL || 'http://localhost:3000'),
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static('uploads'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'frontend-dist')));
(0, routes_1.setupRoutes)(app);
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'frontend-dist', 'index.html'));
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL === '*' ? '*' : (process.env.FRONTEND_URL || 'http://localhost:3000'),
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});
app.set('trust proxy', true);
server.on('upgrade', (req, socket, head) => {
    if (req.headers['x-forwarded-proto'] === 'https') {
        req.connection.encrypted = true;
        req.protocol = 'https';
        req.secure = true;
    }
});
(0, socket_1.setupSocket)(io);
const PORT = parseInt(process.env.PORT || '5680', 10);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map