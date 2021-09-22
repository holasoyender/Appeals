import * as mongoose from "mongoose";
const BlockedUser = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    ID: { type: String, required: true, unique: true },

});
export default mongoose.model("Bloqueados", BlockedUser, "Bloqueados");