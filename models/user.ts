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
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: "Message",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
