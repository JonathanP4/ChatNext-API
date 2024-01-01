import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { getToken } from "../util/token";
import { SECRET } from "../app";

export async function signup(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(401).json({ status: 401, message: errors.array() });
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                status: 400,
                message: [
                    {
                        msg: "Email invalid",
                    },
                ],
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            email,
            name,
            password: hashedPassword,
            status: "Hey there! I'm new here!",
            image: "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg",
            messages: [],
        });
        await user.save();

        return res
            .status(201)
            .json({ message: "User created", userId: user._id });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(401).json({ status: 401, message: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 401,
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
                status: 401,
                message: [
                    { msg: "Email or password are incorrect", status: 401 },
                ],
            });
        }
        const token = jwt.sign({ email: user.email, userId: user._id }, SECRET);

        return res
            .status(200)
            .json({ message: "Login successfull", token, userId: user._id });
    } catch (error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const token = getToken(req);
        console.log(token);

        jwt.verify(token, SECRET);

        return res.status(200).json({ message: "Logout successfull" });
    } catch (error) {
        next(error);
    }
}
