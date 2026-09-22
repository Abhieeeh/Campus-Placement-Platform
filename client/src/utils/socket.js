/**
 * socket.js  –  Client-side Socket.IO singleton
 *
 * Usage
 * -----
 *   import { connectSocket, disconnectSocket, getSocket } from './socket';
 *
 *   // After login:
 *   connectSocket(userId, role);
 *
 *   // In a component:
 *   const socket = getSocket();
 *   socket.on('new_notification', handler);
 *
 *   // On logout:
 *   disconnectSocket();
 */

import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let _socket = null;

/**
 * Connect to the Socket.IO server and join the user's private room.
 * Safe to call multiple times – re-uses an existing live connection.
 */
export function connectSocket(userId, role) {
    if (_socket && _socket.connected) return _socket;

    _socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
    });

    _socket.on('connect', () => {
        console.log('[Socket] Connected:', _socket.id);
        // Join user-specific and role-specific rooms
        _socket.emit('join', { userId, role });
    });

    _socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
    });

    _socket.on('connect_error', (err) => {
        console.warn('[Socket] Connection error:', err.message);
    });

    return _socket;
}

/** Disconnect and clear the singleton */
export function disconnectSocket() {
    if (_socket) {
        _socket.disconnect();
        _socket = null;
    }
}

/** Return the current socket instance (or null if not connected) */
export function getSocket() {
    return _socket;
}
