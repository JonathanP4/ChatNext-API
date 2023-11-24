import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        fromSelf: Boolean,
        from: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
