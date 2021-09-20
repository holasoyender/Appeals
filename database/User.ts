import * as mongoose from "mongoose";
const User = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    Email: { type: String, required: true },
    ID: { type: String, required: true, unique: true },
    Tag: { type: String, required: true },
    Avatar: { type: String, required: true },
    Guilds: { type: Array, required: true }

});
export default mongoose.model("Usuarios", User, "Usuarios");