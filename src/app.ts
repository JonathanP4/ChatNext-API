import path from "path";
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
import Message from "./models/message";
import User from "./models/user";

import { webSocket } from "./socket";

dotenv.config();

export const port = process.env.PORT || 8080;
export const uri = process.env.URI as string;
export const secret = process.env.SECRET as string;
export const origin = process.env.ORIGIN as string;

const app = express();
const httpServer = createServer(app);

webSocket(httpServer);

app.use(cookieParser(secret));

app.use("/images", express.static(path.join(__dirname, "..", "public/images")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(secret));

app.use((req, res, next) => {
    res.header(
        `Access-Control-Allow-Origin`,
        `https://chat-next-frontend.vercel.app`
    );
    res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.header(
        `Access-Control-Allow-Headers`,
        `X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version`
    );
});

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: err.message });
});

(async function main() {
    try {
        await mongoose.connect(uri);

        httpServer.listen(port, () =>
            console.log("⚡[server]: Server listening on port " + port)
        );

        // await Message.deleteMany();
        // const users = await User.find();

        // users.forEach(async (user) => {
        //     user.messages = [];
        //     await user.save();
        // });
    } catch (error) {
        console.log(error);
    }
})();
