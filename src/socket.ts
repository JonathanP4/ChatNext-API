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
                credentials: true,
                methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
                allowedHeaders: [
                    "Content-Type",
                    "Authorization",
                    "Accept-Type",
                    "Authorization",
                ],
            },
        });

        io.on("connection", async (socket) => {
            console.log(`User ${socket.id} connected`);

            const token = socket.request.headers.cookie
                ?.split(";")
                .find((el) => /token/gi.test(el))
                ?.split("=")[1];

            if (!token) {
                io.to(socket.id).emit("not_auth", "Not authorized");
                return;
            }

            console.log(validateToken(token));

            const { userId } = decodeToken(token);
            const user = await User.findById(userId);

            if (!user) {
                io.to(socket.id).emit("user_undefined", {
                    error: new Error("User not found, try reloading the page"),
                });
                return;
            }
            user.socketId = socket.id;
            await user.save();

            const users = await User.find().select("-password");

            if (users) {
                const filteredUsers = users.filter(
                    (u) => u._id.toString() !== user._id.toString()
                );
                io.to(socket.id).emit("users", filteredUsers);
            }

            // socket.broadcast.emit("user_connected");

            // socket.on("get_messages", async (contactId) => {
            //     const sentMessages = await Message.find({
            //         from: user._id,
            //         to: contactId,
            //     });

            //     const receivedMessages = await Message.find({
            //         from: contactId,
            //         to: user._id,
            //     });

            //     const allMessages = [...sentMessages, ...receivedMessages];

            //     allMessages.sort((a, b) =>
            //         a._id.toString().localeCompare(b._id.toString())
            //     );

            //     io.to(socket.id).emit("get_messages", allMessages);
            // });

            // socket.on("private_message", async ({ message, to }) => {
            //     const newMessage = new Message({
            //         content: message,
            //         from: user._id,
            //         to,
            //     });

            //     user.messages.push(newMessage._id);

            //     await newMessage.save();
            //     await user.save();

            //     // socket.to would only send the message to the target client
            //     // io.emit sends to both client who emitted event and target client
            //     io.to(socket.id)
            //         .to(to.socketId)
            //         .emit("private_message", newMessage);
            // });

            // socket.on("disconnect", () => {
            //     console.log(`User ${socket.id} disconnected`);
            // });
        });
    } catch (err) {
        console.log(err);
    }
}
