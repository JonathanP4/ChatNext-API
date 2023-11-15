import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
import io from "./socket.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
dotenv.config();
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
const port = process.env.PORT;
const uri = process.env.URI;
const secret = process.env.SECRET;
const app = express();
app.use(cookieParser(secret));
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./images"),
    filename: (req, file, cb) => {
        cb(null, randomUUID() + "-" + file.originalname);
    },
});
const upload = multer({
    dest: "./images",
    storage: diskStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/webp" ||
            file.mimetype === "image/png") {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
});
app.use(cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: "POST,PUT,DELETE,GET,PATCH",
}));
app.use("/images", express.static(path.join(__dirname, "..", "/images")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(secret));
app.use(upload.single("image"));
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
(async function main() {
    try {
        await mongoose.connect(uri);
        const server = app.listen(port, () => console.log("⚡[server]: Server listening on port " + port));
        // await Message.deleteMany();
        // const users = await User.find();
        // users.forEach(async (user) => {
        //     user.messages = [];
        //     await user.save();
        // });
        io.init(server).on("connection", (socket) => console.log("Client connected"));
    }
    catch (error) {
        console.log(error);
    }
})();
