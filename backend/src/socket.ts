import { Server, Socket } from 'socket.io';

interface GuestSession {
  id: string;
  lastUpdated: Date;
}

let guestSessions: GuestSession[] = [];

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Handle clipboard updates
    socket.on('clipboard-update', async (data) => {
      try {
        // Determine if this is a guest or authenticated user
        const userId = socket.handshake.query.userId as string;
        const isGuest = !userId || userId === 'guest';

        if (isGuest) {
          // Add to guest sessions if not already present
          const sessionExists = guestSessions.some(session => session.id === socket.id);
          if (!sessionExists) {
            guestSessions.push({
              id: socket.id,
              lastUpdated: new Date()
            });
          }

          // Update all guest connections (including the sender)
          io.emit('clipboard-update', data);
        } else {
          // For authenticated users, we broadcast to all user sessions including the sender
          io.to(`user_${userId}`).emit('clipboard-update', data);
        }
      } catch (error) {
        console.error('Error handling clipboard update:', error);
      }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Remove from guest sessions if present
      guestSessions = guestSessions.filter(session => session.id !== socket.id);
    });

    // Handle user authentication
    socket.on('user-authenticated', (userId: string) => {
      // Join user-specific room
      socket.join(`user_${userId}`);
    });
  });
};