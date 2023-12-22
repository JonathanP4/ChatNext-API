import { createServer } from "http";

import express from "express";
import { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import userRoutes from "./routes/user";

import Message from "./models/message";
import User from "./models/user";

import { webSocket } from "./socket";

dotenv.config();

export const PORT = process.env.PORT || 8080;
export const URI = process.env.URI as string;
export const SECRET = process.env.SECRET as string;

const app = express();
const httpServer = createServer(app);

webSocket(httpServer);

app.use(cookieParser(SECRET));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(SECRET));

app.use(
    cors({
        origin: process.env.ORIGIN,
    })
);

app.get("/api/hello", (req, res, next) => {
    res.write("Hello from ChatNext API");
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ status: 500, message: err.message });
    next();
});

(async function main() {
    try {
        await mongoose.connect(URI);

        httpServer.listen(PORT, () =>
            console.log("⚡[server]: Server listening on port " + PORT)
        );

        // const users = await User.find({});

        // users.forEach(async (u) => {
        //     u.messages = [];
        //     await u.save();
        // });

        // await Message.deleteMany({});
    } catch (error) {
        console.log(error);
    }
})();
