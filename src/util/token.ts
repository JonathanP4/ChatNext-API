import jwt from "jsonwebtoken";
import { Request } from "express";

type UserType = {
    email: string;
    userId: string;
    iat: number;
    exp: number;
};

export function getToken(req: Request) {
    return req.get("Authorization")!.split(" ")[1];
}

export function decodeToken(token: string) {
    return jwt.decode(token) as UserType;
}
