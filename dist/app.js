"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const socket_1 = __importDefault(require("./socket"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
dotenv_1.default.config();
const port = process.env.PORT;
const uri = process.env.URI;
const secret = process.env.SECRET;
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)(secret));
const diskStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, "./public/images"),
    filename: (req, file, cb) => {
        cb(null, (0, crypto_1.randomUUID)() + "-" + file.originalname);
    },
});
const upload = (0, multer_1.default)({
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
app.use((0, cors_1.default)({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: "POST,PUT,DELETE,GET,PATCH",
}));
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "..", "public/images")));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)(secret));
app.use(upload.single("image"));
app.use("/auth", auth_1.default);
app.use("/chat", chat_1.default);
app.use("/hello", (req, res) => {
    res.write(path_1.default.join(__dirname, "..", "public/images"));
});
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
(async function main() {
    try {
        await mongoose_1.default.connect(uri);
        const server = app.listen(port, () => console.log("⚡[server]: Server listening on port " + port));
        // await Message.deleteMany();
        // const users = await User.find();
        // users.forEach(async (user) => {
        //     user.messages = [];
        //     await user.save();
        // });
        socket_1.default.init(server).on("connection", (socket) => console.log("Client connected"));
    }
    catch (error) {
        console.log(error);
    }
})();
