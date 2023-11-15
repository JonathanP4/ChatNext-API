import { Request } from "express";

export function getToken(req: Request) {
    return req.get("Authorization")!.split(" ")[1];
}
