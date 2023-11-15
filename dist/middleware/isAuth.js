import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getToken } from "../util/getToken.js";
dotenv.config();
const secret = process.env.SECRET;
export default function isAuth(req, res, next) {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized user" });
    }
    jwt.verify(token, secret);
    next();
}
