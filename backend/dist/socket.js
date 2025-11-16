"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
let guestSessions = [];
const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('clipboard-update', async (data) => {
            try {
                const userId = socket.handshake.query.userId;
                const isGuest = !userId || userId === 'guest';
                if (isGuest) {
                    const sessionExists = guestSessions.some(session => session.id === socket.id);
                    if (!sessionExists) {
                        guestSessions.push({
                            id: socket.id,
                            lastUpdated: new Date()
                        });
                    }
                    io.emit('clipboard-update', data);
                }
                else {
                    io.to(`user_${userId}`).emit('clipboard-update', data);
                }
            }
            catch (error) {
                console.error('Error handling clipboard update:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            guestSessions = guestSessions.filter(session => session.id !== socket.id);
        });
        socket.on('user-authenticated', (userId) => {
            socket.join(`user_${userId}`);
        });
    });
};
exports.setupSocket = setupSocket;
//# sourceMappingURL=socket.js.map