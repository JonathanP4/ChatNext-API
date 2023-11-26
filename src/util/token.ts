import jwt from "jsonwebtoken";
import { NextFunction, Request } from "express";

type UserType = {
    email: string;
    userId: string;
    iat: number;
    exp: number;
};

export function getToken(req: Request) {
    if (req.get("Authorization")) {
        return req.get("Authorization")?.split(" ")[1];
    } else {
        return "I tried...";
    }
}

export function decodeToken(token: string) {
    return jwt.decode(token) as UserType;
}
