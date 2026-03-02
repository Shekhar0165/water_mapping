import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

// The hook accepts a callback for incoming messages
export const useSocket = (onMessageReceived?: (event: string, data: any) => void) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        // Only connect if we have a token (authenticated)
        if (!token) return;

        const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

        socketRef.current = io(url, {
            auth: {
                token: `Bearer ${token}`
            },
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to real-time server');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from real-time server');
            setIsConnected(false);
        });

        // Add specific event listeners that we expect from the backend
        const handleEvent = (eventName: string) => (data: any) => {
            if (onMessageReceived) {
                onMessageReceived(eventName, data);
            }
        };

        socketRef.current.on('complaintNew', handleEvent('complaintNew'));
        socketRef.current.on('complaintUpdated', handleEvent('complaintUpdated'));
        socketRef.current.on('pipeStatusChanged', handleEvent('pipeStatusChanged'));
        socketRef.current.on('adminAlert', handleEvent('adminAlert'));

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [token, onMessageReceived]);

    return { isConnected, socket: socketRef.current };
};
