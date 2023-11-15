import { Server } from "socket.io";
let io;
export default {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error("Socket not initialized");
        }
        return io;
    },
};
