import jwt from "jsonwebtoken";
import { NextFunction, Request } from "express";

type UserType = {
    email: string;
    userId: string;
    iat: number;
    exp: number;
};

export function getToken(req: Request, next: NextFunction) {
    if (req.get("Authorization"))
        return req.get("Authorization")?.split(" ")[1];
    else next();
}

export function decodeToken(token: string) {
    return jwt.decode(token) as UserType;
}
