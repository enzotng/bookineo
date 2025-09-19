import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

class SocketService {
    private socket: Socket | null = null;
    private connectionAttempts = 0;
    private maxRetries = 3;

    connect(userId: string) {
        if (this.socket?.connected) {
            return;
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL;
        console.log("Tentative de connexion Socket.io à:", socketUrl);

        try {
            this.socket = io(socketUrl, {
                withCredentials: true,
                transports: ["polling", "websocket"],
                forceNew: true,
                timeout: 10000,
                reconnectionDelay: 2000,
                reconnectionAttempts: this.maxRetries,
            });

            this.socket.on("connect", () => {
                console.log("Socket.io connecté!");
                this.connectionAttempts = 0;
                this.socket?.emit("join", userId);
                toast.success("Connexion temps réel établie");
            });

            this.socket.on("connect_error", (error) => {
                console.error("Erreur connexion Socket.io:", error);
                this.connectionAttempts++;

                if (this.connectionAttempts <= this.maxRetries) {
                    toast.warning(`Tentative de reconnexion... (${this.connectionAttempts}/${this.maxRetries})`);
                } else {
                    toast.error("Impossible de se connecter au chat en temps réel");
                }
            });

            this.socket.on("disconnect", (reason) => {
                console.log("Socket déconnecté:", reason);
                if (reason !== "io client disconnect") {
                    toast.warning("Connexion temps réel interrompue");
                }
            });

            this.socket.on("reconnect", () => {
                console.log("Socket reconnecté");
                toast.success("Connexion temps réel rétablie");
            });
        } catch (error) {
            console.error("Erreur lors de la création du socket:", error);
            toast.error("Erreur lors de l'initialisation du chat temps réel");
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
        this.socket?.on("newMessage", callback);
    }

    offNewMessage() {
        this.socket?.off("newMessage");
    }

    onMessageRead(callback: (data: { messageId: string; readAt: string }) => void) {
        this.socket?.on("messageRead", callback);
    }

    offMessageRead() {
        this.socket?.off("messageRead");
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    getConnectionStatus() {
        if (!this.socket) return "not_initialized";
        if (this.socket.connected) return "connected";
        if (this.socket.disconnected) return "disconnected";
        return "connecting";
    }

    forceReconnect(userId: string) {
        if (this.socket) {
            this.disconnect();
        }
        this.connectionAttempts = 0;
        return this.connect(userId);
    }
}

export const socketService = new SocketService();
