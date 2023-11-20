"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.getToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getToken(req) {
    return req.get("Authorization").split(" ")[1];
}
exports.getToken = getToken;
function decodeToken(token) {
    return jsonwebtoken_1.default.decode(token);
}
exports.decodeToken = decodeToken;
