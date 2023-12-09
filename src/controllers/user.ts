import { NextFunction, Request, Response, response } from "express";
import User from "../models/user";
import { decodeToken, getToken } from "../util/token";

export async function getUserInfo(
    req: Request,
    res: Response,
    next: NextFunction
) {
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

export async function updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const name = req.body.name;
        const status = req.body.status;
        const image = req.body.image;

        const token = getToken(req);
        const { userId } = decodeToken(token);

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
