import User from "../models/user";
import { Request, Response, NextFunction, response } from "express";
import { UserType, decodeToken, getToken } from "../util/token";
import Message from "../models/message";

function getDecodedToken(req: Request): UserType {
    const token = getToken(req);
    const decoded = decodeToken(token);

    return decoded;
}

export async function getUsers(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { userId } = getDecodedToken(req);

        const users = await User.find()
            .select("-password")
            .populate("messages");
        const filteredUsers = users.filter(
            (u) => u._id.toString() !== userId.toString()
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
        const { userId } = getDecodedToken(req);

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

export async function checkLink(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const url = req.body.url;

    try {
        const { userId } = getDecodedToken(req);
        const user = await User.findById(userId);

        if (!user) {
            return res
                .status(404)
                .json({ message: "User not found", status: 404 });
        }

        const isTrusted = user?.trustedLinks?.some(({ origin }) =>
            url.match(origin)
        );

        if (!isTrusted) {
            return res.status(200).json({ isTrusted: false });
        }

        res.status(200).json({ isTrusted: true });
    } catch (error: any) {
        next(new Error(error));
    }
}

export async function saveTrustedLink(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const url = req.body.url;

    try {
        const { userId } = getDecodedToken(req);
        const user = await User.findById(userId);

        if (!user) {
            return res
                .status(404)
                .json({ message: "User not found", status: 404 });
        }

        const origin = new URL(url).origin;

        user.trustedLinks.push({
            origin,
        });

        await user.save();

        res.status(200).json({ message: "Link is now trusted" });
    } catch (error: any) {
        next(new Error(error));
    }
}
