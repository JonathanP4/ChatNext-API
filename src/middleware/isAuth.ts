import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { getToken } from "../util/token";

dotenv.config();

const secret = process.env.SECRET as string;

export default function isAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // const token = getToken(req);

    // if (!token) {
    //     return res.status(401).json({ message: "Unauthorized user" });
    // }

    // jwt.verify(token, secret);

    next();
}
