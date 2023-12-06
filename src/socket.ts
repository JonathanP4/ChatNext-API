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
            const token = socket.handshake.auth.token.value;

            if (!token) {
                io.to(socket.id).emit("not_auth", "Not authenticated");
                return;
            }

            validateToken(token);

            const { userId } = decodeToken(token);

            const user = await User.findById(userId);

            if (!user) {
                io.to(socket.id).emit("user_undefined", "User not found");
                return;
            }

            user.socketId = socket.id;
            await user.save();

            socket.broadcast.emit("user_connected");

            socket.on("get_user", async (userId) => {
                const contact = await User.findById(userId);

                if (!contact) return;

                socket.emit("get_user", contact);
            });
            // socket.on("private_message", () => {
            //     io.to(socket.id).to()
            // })
        });
    } catch (err) {
        console.log(err);
    }
}
