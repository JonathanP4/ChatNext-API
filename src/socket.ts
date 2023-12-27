import { Server as httpServer } from "http";
import { Server } from "socket.io";

import User from "./models/user";
import Message from "./models/message";
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
            const token = socket.handshake.auth.token;

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

            socket.on("private_message", async ({ message, to }) => {
                const privateMessage = new Message({
                    content: message,
                    from: user._id,
                    to: to._id,
                });

                user.messages.push(privateMessage._id);

                await privateMessage.save();
                await user.save();

                io.to(to.socketId)
                    .to(socket.id)
                    .emit("private_message", privateMessage);
            });

            socket.on("latest_message", async (message) => {
                const contact = await User.findById(message.to);

                if (!contact) return;

                io.to(contact.socketId!).emit("latest_message", message);
            });

            socket.on("delete-message", async (msgId) => {
                const message = await Message.findByIdAndDelete(msgId);
                const user = await User.findById(message?.from);
                const contact = await User.findById(message?.to);

                if (!user || !message || !contact) {
                    return;
                }

                const newMessages = user.messages.filter(
                    (msg) => msg.toString() !== msgId
                );

                user.messages = newMessages;
                await user.save();

                if (!user.socketId || !contact.socketId) {
                    return;
                }

                io.to(user.socketId)
                    .to(contact.socketId)
                    .emit("message-deleted");
            });
        });
    } catch (err) {
        console.log(err);
    }
}
