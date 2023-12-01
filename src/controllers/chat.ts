import User from "../models/user";
import { Request, Response, NextFunction, response } from "express";
import { decodeToken, getToken } from "../util/token";
import Message from "../models/message";

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

export async function getProfile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { userId } = decodeToken(req.cookies.token);

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

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res
            .set({
                "Access-Control-Allow-Origin":
                    "https://chat-next-frontend.vercel.app",
            })
            .status(200)
            .json({ message: "User fetched succesfully", user });
    } catch (error) {
        next(error);
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
    const image = req.body.image;
    const { userId } = decodeToken(req.cookies.token);

    try {
        const user = await User.findById(userId);

        if (!user) {
            return response.status(500).json("User not found");
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
