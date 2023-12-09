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

export async function getMessages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = getToken(req);

        const { userId } = decodeToken(token);

        const contactId = req.body._id;

        const userMessages = await Message.find({
            from: userId,
            to: contactId,
        });

        const contactMessages = await Message.find({
            from: contactId,
            to: userId,
        });

        const allMessages = [...userMessages, ...contactMessages].sort((a, b) =>
            a._id.toString().localeCompare(b._id.toString())
        );

        return res.status(200).json({ messages: allMessages });
    } catch (error: any) {
        next(new Error(error));
    }
}
