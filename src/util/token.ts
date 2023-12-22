import jwt from "jsonwebtoken";
import { Request } from "express";

export type UserType = {
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

export function validateToken(token: string) {
    return jwt.verify(token, process.env.SECRET!);
}
