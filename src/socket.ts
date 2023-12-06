import { Server as httpServer } from "http";
import { Server } from "socket.io";

import User from "./models/user";
import Message from "./models/message";
import cookie from "cookie";
import { decodeToken, validateToken } from "./util/token";

type MessageType = {
    content: string;
    from: string;
    to: string;
};

type UserType = {
    _id: string;
    email: string;
    name: string;
    image: string;
    password: string;
    status: string;
    messages: [];
    createdAt: string;
    updatedAt: string;
    __v: number;
};

export function webSocket(httpServer: httpServer) {
    try {
        const io = new Server(httpServer, {
            cors: {
                origin: process.env.ORIGIN,
            },
        });

        io.on("connection", async (socket) => {
            //h
            console.log(socket.handshake.auth);
        });
    } catch (err) {
        console.log(err);
    }
}
