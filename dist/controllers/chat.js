"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMessages = exports.postMessage = exports.getUser = exports.getUsers = void 0;
const user_1 = __importDefault(require("../models/user"));
const express_1 = require("express");
const token_1 = require("../util/token");
const message_1 = __importDefault(require("../models/message"));
const socket_1 = __importDefault(require("../socket"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const root_path_1 = require("../util/root-path");
async function getUsers(req, res, next) {
    try {
        const token = (0, token_1.getToken)(req);
        const decoded = (0, token_1.decodeToken)(token);
        const users = await user_1.default.find()
            .select("-password")
            .populate("messages");
        const filteredUsers = users.filter((u) => u._id.toString() !== decoded.userId.toString());
        if (!users) {
            return res.status(500).json({
                message: "Failed to fetch users from database, we are sorry for the inconvinience.",
            });
        }
        return res.json({
            message: "Users fetching succeeded",
            users: filteredUsers,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.getUsers = getUsers;
async function getUser(req, res, next) {
    try {
        const userId = req.params.userId;
        const user = await user_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res
            .status(200)
            .json({ message: "User fetched succesfully", user });
    }
    catch (error) {
        next(error);
    }
}
exports.getUser = getUser;
async function postMessage(req, res, next) {
    try {
        const content = req.body.message;
        const contact = req.body.user;
        const token = (0, token_1.getToken)(req);
        const decoded = (0, token_1.decodeToken)(token);
        const user = await user_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(500).json("User not found");
        }
        const message = new message_1.default({
            content,
            from: user._id,
            to: contact._id,
        });
        user.messages.unshift(message._id);
        await message.save();
        await user.save();
        const io = socket_1.default.getIo();
        io.emit("message", { message: message, action: "post" });
    }
    catch (error) {
        next(new Error(error));
    }
}
exports.postMessage = postMessage;
async function getMessages(req, res, next) {
    try {
        const contactId = req.params.userId;
        const token = (0, token_1.getToken)(req);
        const decoded = (0, token_1.decodeToken)(token);
        const userMessages = await message_1.default.find({
            from: decoded.userId,
            to: contactId,
        });
        const contactMessages = await message_1.default.find({
            from: contactId,
            to: decoded.userId,
        });
        if (!userMessages || !contactMessages) {
            console.log("here");
            return express_1.response.status(500).json("User not found");
        }
        const messages = [...userMessages, ...contactMessages].sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
        return res.status(200).json({ messages });
    }
    catch (error) {
        next(new Error(error));
    }
}
exports.getMessages = getMessages;
async function updateProfile(req, res, next) {
    const name = req.body.name;
    const status = req.body.status;
    const image = req.file?.path.replaceAll("public\\", "");
    const userId = req.params.userId;
    try {
        const user = await user_1.default.findById(userId);
        if (!user) {
            return express_1.response.status(500).json("User not found");
        }
        if (user.image !== "images/placeholder.jpg") {
            fs_1.default.unlink(path_1.default.join(root_path_1.rootPath, "..", "public", user.image), () => {
                console.log("deleted file");
            });
        }
        user.name = name;
        user.status = status;
        user.image = image;
        await user.save();
        return res.status(201).json({ message: "User updated", user });
    }
    catch (error) {
        next(new Error(error));
    }
}
exports.updateProfile = updateProfile;
