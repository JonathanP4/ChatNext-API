import path from "path";
import { randomUUID } from "crypto";

import express from "express";
import { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
import io from "./socket";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import Message from "./models/message";
import User from "./models/user";

dotenv.config();

const port = process.env.PORT;
const uri = process.env.URI as string;
const secret = process.env.SECRET;

const app = express();
app.use(cookieParser(secret));

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./public/images"),
    filename: (req, file, cb) => {
        cb(null, randomUUID() + "-" + file.originalname);
    },
});

const upload = multer({
    dest: "./images",
    storage: diskStorage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/webp" ||
            file.mimetype === "image/png"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});

app.use(
    cors({
        origin: "*",
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Access-Control-Allow-Origin",
        ],
        methods: "POST,PUT,DELETE,GET,PATCH",
    })
);

app.use("/images", express.static(path.join(__dirname, "..", "public/images")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(secret));
app.use(upload.single("image"));

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

app.use("/hello", (req, res) => {
    res.write(path.join(__dirname, "..", "public/images"));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: err.message });
});

(async function main() {
    try {
        await mongoose.connect(uri);

        const server = app.listen(port, () =>
            console.log("⚡[server]: Server listening on port " + port)
        );

        // await Message.deleteMany();
        // const users = await User.find();

        // users.forEach(async (user) => {
        //     user.messages = [];
        //     await user.save();
        // });

        io.init(server);
    } catch (error) {
        console.log(error);
    }
})();
