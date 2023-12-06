import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { getToken } from "../util/token";

dotenv.config();

export default function isAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ message: "Unauthorized user" });
    }

    jwt.verify(token, process.env.SECRET!);

    next();
}
