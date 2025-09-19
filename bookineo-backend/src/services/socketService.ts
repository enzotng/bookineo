import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server<any, any, any, any>;
const userSockets: Map<string, string> = new Map();

export const initSocket = (server: HttpServer): Server<any, any, any, any> => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["polling", "websocket"],
    });

    io.on("connection", (socket: Socket<any, any, any, any>) => {
        console.log("Socket connecté:", socket.id);

        socket.on("join", (userId: string) => {
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

export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

export const getIO = (): Server<any, any, any, any> | undefined => io;
