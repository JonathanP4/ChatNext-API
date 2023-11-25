import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { getToken } from "../util/token";
import { secret } from "../app";

export async function signup(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(401).json({ message: errors.array() });
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: [
                    {
                        msg: "Email invalid",
                        status: 400,
                    },
                ],
            });
        }

        const user = new User({
            email,
            name,
            password: hashedPassword,
            status: "Hey there! I'm new here!",
            image: "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg",
            messages: [],
        });
        await user.save();

        return res.status(201).json({ message: "User created", user });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(401).json({ message: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: [
                    {
                        msg: "Email or password are incorrect",
                        status: 401,
                    },
                ],
            });
        }

        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (!passwordCorrect) {
            return res.status(401).json({
                message: [
                    { msg: "Email or password are incorrect", status: 401 },
                ],
            });
        }
        const token = jwt.sign({ email: user.email, userId: user._id }, secret);

        res.cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: "none",
            secure: true,
        });

        return res
            .status(200)
            .json({ message: "Login successfull", token, user });
    } catch (error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const token = getToken(req);

        jwt.verify(token, secret);

        return res.status(200).json({ message: "Logout successfull" });
    } catch (error) {
        next(error);
    }
}
