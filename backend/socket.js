/**
 * socket.js  –  Socket.IO initialisation & room management
 *
 * Strategy
 * --------
 *   • Every authenticated user joins a private room keyed by their userId
 *     so the server can push notifications to a specific person.
 *   • A shared "students" room is used for broadcasts (e.g. new job posts).
 *   • The exported `getIO()` helper lets any controller emit events without
 *     importing the full server module.
 */

import { Server } from 'socket.io';

let _io = null;

/**
 * Attach Socket.IO to the given http.Server instance.
 * Call this once from server.js, passing the raw http server.
 */
export function initSocket(httpServer) {
    _io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    _io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        /**
         * Client emits { userId, role } immediately after connecting
         * so we can place them in the right room(s).
         */
        socket.on('join', ({ userId, role }) => {
            if (!userId) return;

            // Private user room  →  "user:<userId>"
            socket.join(`user:${userId}`);
            console.log(`[Socket] ${socket.id} joined room user:${userId} (role: ${role})`);

            // Students also join the broadcast room for job notifications
            if (role === 'student') {
                socket.join('students');
                console.log(`[Socket] ${socket.id} joined room "students"`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    return _io;
}

/**
 * Return the Socket.IO server instance (throws if not yet initialised).
 */
export function getIO() {
    if (!_io) throw new Error('Socket.IO has not been initialised. Call initSocket() first.');
    return _io;
}
