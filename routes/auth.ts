import { Router } from "express";
const router = Router();
import * as passport from "passport";
import * as path from "path";
import { checkBans } from "../main";
import { getFormHTML } from "../view/form";
import Appeal from "../database/Appeal";
import * as mongoose from "mongoose";

router.get("/discord", passport.authenticate("discord"));

router.get("/discord/redirect", passport.authenticate("discord"), async (req, res) => {
    let user: any = await req.user;
    if (user.Guilds.find(g => g.id === process.env.GUILD_ID)) {
        res.sendFile(path.join(__dirname, "/error.html"))
    } else {
        let isBanned = await checkBans(user.ID)
        if (!isBanned) return res.sendFile(path.join(__dirname, "/error.html"))

        res.redirect(req.baseUrl + '/form');
    }
})

router.get("/form", (req, res) => {
    if(!req.user) return res.redirect(req.baseUrl + '/unknown');
    res.append("Content-Type", "text/html").send(getFormHTML(req.user))
})

router.get("/form/get", async (req, res) => {

    let user:any = req.user;
    if(!req.user) return res.redirect(req.baseUrl + '/unknown');
    if(
        !req.query ||
        !req.query.banReason ||
        !req.query.appealText ||
        !req.query.futureActions
    ) return res.redirect(req.baseUrl + '/unknown');

    let { banReason, appealText, futureActions } = req.query;
    let AppealID = await generateToken()

    let exist = await Appeal.findOne({
        UserID: user.ID,
        Unbanned: false
    })

    if(exist) return res.sendFile(path.join(__dirname, "/doubleForm.html"))

    const newAppeal = new Appeal({
        _id: new mongoose.Types.ObjectId(),

        AppealID,
        UserID: user.ID,
        User: {
            ID: user.ID,
            Email: user.Email,
            Tag: user.Tag,
            Avatar: user.Avatar
        },
        Unbanned: false,

        banReason,
        appealText,
        futureActions
    })

    newAppeal.save()
        .then(doc => console.log(doc))
        .catch(console.error)

    return res.sendFile(path.join(__dirname, "/success.html"))
})

async function generateToken() {

    const token = Math.floor(Math.random() * 50000) + 1;

    let id = await Appeal.findOne({
        AppealID: token
    })

    if(!id) return token.toString();
    await generateToken();
}


export default router