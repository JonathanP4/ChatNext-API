import { ObjectId } from "mongoose";

declare global {
    type UserType = {
        email: string;
        userId: string;
        iat: number;
        exp: number;
    };

    type MessageType = {
        _id: ObjectId;
        content: string;
        from: ObjectId;
        to: ObjectId;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        __v: number;
    };
}
