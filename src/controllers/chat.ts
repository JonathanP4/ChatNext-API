import User from "../models/user";
import { Request, Response, NextFunction, response } from "express";
import { decodeToken, getToken } from "../util/token";
import Message from "../models/message";

import socket from "../socket";
import fs from "fs";
import path from "path";
import { rootPath } from "../util/root-path";

export async function getUsers(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = getToken(req);

        const decoded = decodeToken(token);

        const users = await User.find()
            .select("-password")
            .populate("messages");
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
        const contact = req.body.user;

        const token = getToken(req);
        const decoded = decodeToken(token);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(500).json("User not found");
        }

        const message = new Message({
            content,
            from: user._id,
            to: contact._id,
        });

        user.messages.unshift(message._id);

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
        const contactId = req.params.userId;
        const token = getToken(req);
        const decoded = decodeToken(token);

        const userMessages = await Message.find({
            from: decoded.userId,
            to: contactId,
        });
        const contactMessages = await Message.find({
            from: contactId,
            to: decoded.userId,
        });

        if (!userMessages || !contactMessages) {
            console.log("here");
            return response.status(500).json("User not found");
        }

        const messages = [...userMessages, ...contactMessages].sort((a, b) =>
            a._id.toString().localeCompare(b._id.toString())
        );

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
    const image = req.file?.path.replaceAll("public\\", "");
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return response.status(500).json("User not found");
        }

        if (user.image !== "images/placeholder.jpg") {
            fs.unlink(
                path.join(rootPath, "..", "public", user.image as string),
                () => {
                    console.log("deleted file");
                }
            );
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