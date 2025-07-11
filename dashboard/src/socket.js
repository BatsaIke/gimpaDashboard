// src/socket.js
import io from 'socket.io-client';

// Make sure to replace 'http://10.0.2.2' with your actual server IP if different
// and use port 4100 for socket connections
const SOCKET_URL = 'http://10.0.2.2:4100';

const socket = io(SOCKET_URL, {
    autoConnect: true,  // Automatically attempt to connect on startup
    reconnection: true  // Enable auto-reconnection
});

// Export the socket instance for use throughout the app
export default socket;
