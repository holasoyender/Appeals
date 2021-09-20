import * as mongoose from "mongoose";
const User = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    AppealID: { type: String, required: true },
    UserID: { type: String, required: true },
    User: { type: Object, required: true },
    Unbanned: { type: Boolean, required: true },

    banReason: { type: String, required: true },
    appealText: { type: String, required: true },
    futureActions: { type: String, required: true },

});
export default mongoose.model("Appeals", User, "Appeals");