export function getToken(req) {
    return req.get("Authorization").split(" ")[1];
}
