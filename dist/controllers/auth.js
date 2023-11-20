"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.signup = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const token_1 = require("../util/token");
dotenv_1.default.config();
const secret = process.env.SECRET;
async function signup(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({ message: errors.array() });
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const userExists = await user_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: [
                    {
                        msg: "Email invalid",
                        status: 400,
                    },
                ],
            });
        }
        const user = new user_1.default({
            email,
            name,
            password: hashedPassword,
            status: "Hey there! I'm new here!",
            image: "images/placeholder.jpg",
            messages: [],
        });
        await user.save();
        return res.status(201).json({ message: "User created", user });
    }
    catch (error) {
        next(error);
    }
}
exports.signup = signup;
async function login(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({ message: errors.array() });
    }
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await user_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: [
                    {
                        msg: "Email or password are incorrect",
                        status: 401,
                    },
                ],
            });
        }
        const passwordCorrect = await bcrypt_1.default.compare(password, user.password);
        if (!passwordCorrect) {
            return res
                .status(401)
                .json({ message: "Email or password are incorrect" });
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, userId: user._id }, secret);
        res.cookie("token", token);
        return res.status(200).json({ message: "Login successfull", token });
    }
    catch (error) {
        next(error);
    }
}
exports.login = login;
async function logout(req, res, next) {
    try {
        const token = (0, token_1.getToken)(req);
        jsonwebtoken_1.default.verify(token, secret);
        return res.status(200).json({ message: "Logout successfull" });
    }
    catch (error) {
        next(error);
    }
}
exports.logout = logout;
