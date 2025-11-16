"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userService_1 = require("../services/userService");
exports.authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ error: 'Username and password are required' });
                return;
            }
            let user = await userService_1.userService.findByUsername(username);
            if (!user) {
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                user = await userService_1.userService.create(username, hashedPassword);
            }
            else {
                const isValid = await bcryptjs_1.default.compare(password, user.password);
                if (!isValid) {
                    res.status(401).json({ error: 'Invalid credentials' });
                    return;
                }
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });
            return;
        }
        catch (error) {
            console.error('Error during authentication:', error);
            res.status(500).json({ error: 'Authentication failed' });
            return;
        }
    },
    register: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ error: 'Username and password are required' });
                return;
            }
            const existingUser = await userService_1.userService.findByUsername(username);
            if (existingUser) {
                res.status(409).json({ error: 'User already exists' });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await userService_1.userService.create(username, hashedPassword);
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });
            return;
        }
        catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ error: 'Registration failed' });
            return;
        }
    }
};
//# sourceMappingURL=authController.js.map