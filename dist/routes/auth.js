"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const authController = __importStar(require("../controllers/auth"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const express_validator_1 = require("express-validator");
router.post("/signup", [
    (0, express_validator_1.body)("email", "Invalid email").trim().isEmail().normalizeEmail(),
    (0, express_validator_1.body)("name", "Name required").trim().notEmpty(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password should be at least 6 characters long")
        .trim()
        .notEmpty()
        .withMessage("Password required"),
], authController.signup);
router.post("/login", [
    (0, express_validator_1.body)("email", "Invalid email").trim().isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password", "Password required").trim().notEmpty(),
], authController.login);
router.post("/logout", isAuth_1.default, authController.logout);
exports.default = router;
