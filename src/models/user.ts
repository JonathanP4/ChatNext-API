import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        image: String,
        password: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        socketId: String,
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: "Message",
            },
        ],
        trustedLinks: [
            {
                origin: String,
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
