import express from "express";
const router = express.Router();
import * as authController from "../controllers/auth.js";
import isAuth from "../middleware/isAuth.js";
import { body } from "express-validator";
router.post("/signup", [
    body("email", "Invalid email").trim().isEmail().normalizeEmail(),
    body("name", "Name required").trim().notEmpty(),
    body("password", "Password required").trim().notEmpty(),
], authController.signup);
router.post("/login", [
    body("email", "Invalid email").trim().isEmail().normalizeEmail(),
    body("password", "Password required").trim().notEmpty(),
], authController.login);
router.post("/logout", isAuth, authController.logout);
export default router;
