import { Server } from "socket.io";

let io;
const userSockets = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['polling', 'websocket']
    });

    io.on("connection", (socket) => {
        console.log("Socket connecté:", socket.id);

        socket.on("join", (userId) => {
            console.log("User rejoint:", userId);
            userSockets.set(userId, socket.id);
            socket.join(`user_${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("Socket déconnecté:", socket.id);
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

export const getIO = () => io;