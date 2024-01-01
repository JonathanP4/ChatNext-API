import { Server as httpServer } from "http";
import { Server } from "socket.io";

import User from "./models/user";
import Message from "./models/message";
import { decodeToken, validateToken } from "./util/token";

type MessageType = {
    _id: string;
    content: string;
    from: string;
    to: string;
    replyTo?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
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
    socketId: string;
    trustedLinks: [{ origin: string; id: string }];
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

            socket.on(
                "private_message",
                async ({
                    message,
                    to,
                }: {
                    message: MessageType;
                    to: UserType;
                }) => {
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
                }
            );

            socket.on("latest_message", async (message: MessageType) => {
                const contact = await User.findById(message.to);

                if (!contact) return;

                io.to(contact.socketId!).emit("latest_message", message);
            });

            socket.on("delete-message", async (msgId: string) => {
                const message = await Message.findByIdAndDelete(msgId);
                const contact = await User.findById(message?.to);

                if (!message || !contact) {
                    return;
                }

                const newMessages = user.messages.filter(
                    (msg) => msg.toString() !== msgId
                );

                user.messages = newMessages;
                await user.save();

                if (!contact.socketId) {
                    return;
                }

                io.to(socket.id).to(contact.socketId).emit("message-deleted");
            });

            socket.on(
                "message_edit",
                async ({
                    messageId,
                    content,
                }: {
                    messageId: string;
                    content: string;
                }) => {
                    const message = await Message.findById(messageId);

                    if (!message) {
                        return;
                    }

                    const contact = await User.findById(message.to);

                    message.content = content;
                    await message.save();

                    if (!contact?.socketId) return;

                    io.to(socket.id).to(contact.socketId).emit("message_edit");
                }
            );

            socket.on(
                "message_reply",
                async ({
                    repliedMessage,
                    content,
                }: {
                    repliedMessage: MessageType;
                    content: string;
                }) => {
                    const message = new Message({
                        content,
                        from: user._id,
                        replyTo: {
                            content: repliedMessage.content,
                            messageId: repliedMessage._id,
                        },
                        to: repliedMessage.from,
                    });

                    await message.save();

                    const contact = await User.findById(message.to);

                    if (!contact || !contact?.socketId) {
                        io.to(socket.id).emit(
                            "user_undefined",
                            "User not found"
                        );
                        return;
                    }

                    io.to(socket.id)
                        .to(contact.socketId)
                        .emit("message-reply", message);
                }
            );
        });
    } catch (err) {
        console.log(err);
    }
}
