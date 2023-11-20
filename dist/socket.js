"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
let io;
exports.default = {
    init: (httpServer) => {
        io = new socket_io_1.Server(httpServer, {
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
