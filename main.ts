import { config } from "dotenv";
config()

import * as express from "express";
import * as passport from "passport";
import router from "./routes";
import "./strategies/discord";
import * as mongoose from "mongoose";
import * as session from "express-session";
import * as path from "path";
import { Client } from "discord.js"

const Store = require("connect-mongo")
const client = new Client({
    intents: [ "GUILDS", "GUILD_BANS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]
})
const app = express();
const PORT = process.env.PORT || 4001;

mongoose.connect("mongodb://localhost/Appeals", {
    autoIndex: false,
    connectTimeoutMS: 10000,
})

app.use(session({
    secret: process.env.APP_SECRET || "holasoyender",
    cookie: {
        maxAge: 60000 * 60 * 24,
    },
    resave: false,
    saveUninitialized: false,
    store: new Store({
        mongoUrl: "mongodb://localhost/Appeals",
        mongoOptions: {
            connectTimeoutMS: 10000,
        },
        client: session,
    })
}))
app.use(passport.initialize())
app.use(passport.session())

app.use("/api", router);

app.use("/", (req, res) => res.sendFile(path.join(__dirname, "/routes/views/index.html")));

client.on("ready", () => console.log(`Bot iniciado como ${client.user.username}!`));

export async function checkBans(userId) {
    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if(!guild) return false
    try {
        let bans = await guild.bans.fetch();
        return bans.has(userId)
    }catch (e) {
        console.log("No tengo permisos para ver los bans del servidor!")
        return false
    }
}

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto: ${PORT}`));
client.login(process.env.BOT_TOKEN).catch()