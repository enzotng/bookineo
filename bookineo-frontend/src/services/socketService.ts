import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string) {
        if (this.socket?.connected) {
            return;
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        console.log('Tentative de connexion Socket.io à:', socketUrl);

        try {
            this.socket = io(socketUrl, {
                withCredentials: true,
                transports: ['polling', 'websocket'],
                forceNew: true
            });

            this.socket.on('connect', () => {
                console.log('Socket.io connecté!');
                this.socket?.emit('join', userId);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Erreur connexion Socket.io:', error);
            });

        } catch (error) {
            console.error('Erreur lors de la création du socket:', error);
        }

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onNewMessage(callback: (message: any) => void) {
        this.socket?.on('newMessage', callback);
    }

    offNewMessage() {
        this.socket?.off('newMessage');
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();