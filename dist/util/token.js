import jwt from "jsonwebtoken";
export function getToken(req) {
    return req.get("Authorization").split(" ")[1];
}
export function decodeToken(token) {
    return jwt.decode(token);
}
