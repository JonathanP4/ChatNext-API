import mongoose, { Schema } from "mongoose";
const sessionSchema = new Schema({
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    ],
});
export default mongoose.model("Session", sessionSchema);
