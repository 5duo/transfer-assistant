import { io, Socket } from 'socket.io-client';

// Use the same protocol as the current page (HTTP or HTTPS)
// This ensures WebSocket connections work correctly when behind reverse proxy
const currentProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const currentHost = window.location.host;
const SOCKET_URL = `${currentProtocol}//${currentHost}`;

let socket: Socket | null = null;

export const SocketService = {
  connect: () => {
    if (!socket || socket.disconnected) {
      socket = io(SOCKET_URL, {
        transports: ['websocket']  // Prefer WebSocket transport
      });

      socket.on('connect', () => {
        console.log('Connected to server:', socket?.id);

        // If user is logged in, emit authentication event
        const token = localStorage.getItem('token');
        if (token) {
          // We'll send a simple event indicating the user is authenticated
          // The actual user ID will be determined server-side from the token
          socket?.emit('user-authenticated', 'authenticated');
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  onClipboardUpdate: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('clipboard-update', callback);
    }
  },

  offClipboardUpdate: (callback: (data: any) => void) => {
    if (socket) {
      socket.off('clipboard-update', callback);
    }
  },

  emitClipboardUpdate: (data: any, userId?: string) => {
    if (socket) {
      socket.emit('clipboard-update', data);
    }
  }
};