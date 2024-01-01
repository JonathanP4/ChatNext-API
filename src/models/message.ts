import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        from: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        replyTo: {
            content: String,
            messageId: Schema.Types.ObjectId,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
