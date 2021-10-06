import { config } from "dotenv";
config()

import express from "express";
import passport from "passport";
import router from "./routes";
import "./strategies/discord";
import mongoose from "mongoose";
import session from "express-session";
import { start } from "./bot";
import index from "./routes/views/index"

const Store = require("connect-mongo")
const app = express();
const PORT = process.env.PORT || 4001;

// @ts-ignore
mongoose.connect(process.env.MONGODB_URL, {
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
        mongoUrl: process.env.MONGODB_URL,
        mongoOptions: {
            connectTimeoutMS: 10000,
        },
        client: session,
    })
}))
app.use(passport.initialize())
app.use(passport.session())

app.use("/api", router);

app.use("/", (req:any, res:any) => res.append("Content-Type", "text/html").send(index));

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto: ${PORT}`));
start();