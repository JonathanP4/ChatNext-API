import { Router } from "express";
const router = Router();

import * as authController from "../controllers/auth";
import isAuth from "../middleware/isAuth";

import { body } from "express-validator";

router.post(
    "/signup",
    [
        body("email", "Invalid email").trim().isEmail().normalizeEmail(),
        body("name", "Name required").trim().notEmpty(),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password should be at least 6 characters long")
            .trim()
            .notEmpty()
            .withMessage("Password required"),
    ],
    authController.signup
);
router.post(
    "/login",
    [
        body("email", "Invalid email").trim().isEmail().normalizeEmail(),
        body("password", "Password required").trim().notEmpty(),
    ],
    authController.login
);
router.post("/logout", isAuth, authController.logout);

export default router;
