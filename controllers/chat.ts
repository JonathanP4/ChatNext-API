import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { Request, Response, NextFunction, response } from "express";
import { getToken } from "../util/getToken.js";
import Message from "../models/message.js";

import socket from "../socket.js";
import fs from "fs";
import path from "path";
import { __dirname } from "../app.js";

export type UserType = {
    email: string;
    userId: string;
    iat: number;
    exp: number;
};

export async function getUsers(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = getToken(req);

        const decoded = jwt.decode(token) as UserType;

        const users = await User.find().select("-password");
        const filteredUsers = users.filter(
            (u) => u._id.toString() !== decoded.userId.toString()
        );

        if (!users) {
            return res.status(500).json({
                message:
                    "Failed to fetch users from database, we are sorry for the inconvinience.",
            });
        }
        return res.json({
            message: "Users fetching succeeded",
            users: filteredUsers,
        });
    } catch (error) {
        next(error);
    }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res
            .status(200)
            .json({ message: "User fetched succesfully", user });
    } catch (error) {
        next(error);
    }
}

export async function postMessage(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const content = req.body.message;

        const token = getToken(req);
        const decoded = jwt.decode(token) as UserType;

        const user = await User.findById(decoded.userId);

        if (!user) {
            return response.status(500).json("User not found");
        }

        const message = new Message({
            content,
        });

        user.messages.unshift(message._id);
        message.user = user._id;

        await message.save();
        await user.save();

        const io = socket.getIo();
        io.emit("message", { message: message, action: "post" });
    } catch (error: any) {
        next(new Error(error));
    }
}

export async function getMessages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = getToken(req);
        const decoded = jwt.decode(token) as UserType;

        const user = await User.findById(decoded.userId).populate("messages");

        if (!user) {
            return response.status(500).json("User not found");
        }

        const messages = user.messages.reverse();

        return res.status(200).json({ messages });
    } catch (error: any) {
        next(new Error(error));
    }
}

export async function updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const name = req.body.name;
    const status = req.body.status;
    const image = req.file?.path;
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return response.status(500).json("User not found");
        }

        if (user.image !== "images/placeholder.jpg") {
            fs.unlink(path.join(__dirname, "..", user.image as string), () => {
                console.log("deleted file");
            });
        }

        user.name = name;
        user.status = status;
        user.image = image;

        await user.save();

        return res.status(201).json({ message: "User updated", user });
    } catch (error: any) {
        next(new Error(error));
    }
}
