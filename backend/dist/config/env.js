"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_URL = exports.JWT_SECRET = exports.PORT = void 0;
exports.PORT = process.env.PORT || 5680;
exports.JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key_for_development';
exports.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
//# sourceMappingURL=env.js.map