import { Router } from "express";
const router = Router();
import passport from "passport";
import {checkBans, getBanByUserID, sendAppealEmbed} from "../bot";
import { getFormHTML } from "./views/form";
import Appeal from "../database/Appeal";
import  mongoose from "mongoose";
import BlockedUser from "../database/Blocked";
import error from "./views/error";
import blocked from "./views/blocked";
import doubleForm from "./views/doubleForm";
import unknownError from "./views/unknownError";
import success from "./views/success";
import {GuildBan} from "discord.js";
import badDate from "./views/badDate";

router.get("/discord", passport.authenticate("discord"));

router.get("/discord/redirect", passport.authenticate("discord"), async (req, res) => {
    let user: any = await req.user;
    let isBanned = await checkBans(user.ID)
    if (!isBanned) return res.redirect(req.baseUrl + '/error');
    let blockedData = await BlockedUser.find({ID: user.ID})
    if (blockedData[0]) return res.redirect(req.baseUrl + '/blocked');

    let rawBan = await getBanByUserID(user.ID);
    if (rawBan == false) return res.redirect(req.baseUrl + '/error');
    let ban: GuildBan = rawBan;
    let time;

    if (ban.guild.me?.permissions.has("VIEW_AUDIT_LOG")) {
        let allBans = await ban.guild.fetchAuditLogs({type: "MEMBER_BAN_ADD", limit: 100})
        // @ts-ignore
        let bans = allBans.entries.filter(entry => entry !== null && entry.target !== null && entry.target.id === user.ID)
        if (!bans || !bans.first()) return res.redirect(req.baseUrl + '/form');
        time = bans.first()?.createdAt;
    }
    else
        return res.redirect(req.baseUrl + '/form');

    if(!time) return res.redirect(req.baseUrl + '/form');
    let newTime = new Date(time).getTime() + (30 * 24 * 60 * 60 * 1000); //Milisegundos del ban + 30 dias
    let now30 = new Date().getTime();// Milisegundos actuales

    if (newTime < now30) return res.redirect(req.baseUrl + '/form');
    else return res.redirect(req.baseUrl + '/badDate');

})

router.get("/error", async (req, res) => {
    return res.append("Content-Type", "text/html").send(error)
})

router.get("/blocked", async (req, res) => {
    return res.append("Content-Type", "text/html").send(blocked)
})
router.get("/badDate", async (req, res) => {
    return res.append("Content-Type", "text/html").send(badDate)
})

router.get("/form", async (req, res) => {
    if (!req.user) return res.redirect(req.baseUrl + '/discord/redirect');

    let user: any = await req.user;
    let isBanned = await checkBans(user.ID)
    if (!isBanned) return res.redirect(req.baseUrl + '/error');

    let exist = await Appeal.findOne({
        UserID: user.ID,
        Unbanned: false
    })

    if (exist) return res.append("Content-Type", "text/html").send(doubleForm)
    let blockedData = await BlockedUser.find({ID: user.ID})
    if (blockedData[0]) return res.redirect(req.baseUrl + '/blocked');

    let rawBan = await getBanByUserID(user.ID);
    if (rawBan == false) return res.redirect(req.baseUrl + '/error');
    let ban: GuildBan = rawBan;
    let time;

    if (ban.guild.me?.permissions.has("VIEW_AUDIT_LOG")) {
        let allBans = await ban.guild.fetchAuditLogs({type: "MEMBER_BAN_ADD", limit: 100})
        // @ts-ignore
        let bans = allBans.entries.filter(entry => entry !== null && entry.target !== null && entry.target.id === user.ID)
        if (!bans || !bans.first()) return res.append("Content-Type", "text/html").send(getFormHTML(req.user));
        time = bans.first()?.createdAt;
    }
    else
        return res.append("Content-Type", "text/html").send(getFormHTML(req.user));

    if(!time) return res.append("Content-Type", "text/html").send(getFormHTML(req.user));
    let newTime = new Date(time).getTime() + (30 * 24 * 60 * 60 * 1000); //Milisegundos del ban + 30 dias
    let now30 = new Date().getTime();// Milisegundos actuales

    if (newTime < now30) return res.append("Content-Type", "text/html").send(getFormHTML(req.user));
    else return res.redirect(req.baseUrl + '/badDate');

})

router.get("/form/get", async (req, res) => {

    let user:any = req.user;
    if(!req.user) return res.redirect(req.baseUrl + '/discord/redirect');

    let isBanned = await checkBans(user.ID)
    if (!isBanned) return res.redirect(req.baseUrl + '/error');
    let blockedData = await BlockedUser.find({ID: user.ID})
    if (blockedData[0]) return res.redirect(req.baseUrl + '/blocked');

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

    if(exist) return res.append("Content-Type", "text/html").send(doubleForm)

    const newAppeal = new Appeal({
        _id: new mongoose.Types.ObjectId(),

        AppealID,
        MessageID: "none",
        UserID: user.ID,
        User: {
            ID: user.ID,
            Tag: user.Tag,
            Avatar: user.Avatar
        },
        Unbanned: false,

        banReason,
        appealText,
        futureActions
    })

    newAppeal.save()
        .then(async doc => {
            let appeal = await sendAppealEmbed(user, doc);
            if (!appeal) {
                console.log("Error: Ha ocurrido un error intentado mandar el embed de apelación al canal\nPor favor, comprueba la configuración")
                return res.append("Content-Type", "text/html").send(unknownError)
            }
        })
        .catch(e => { console.log(e); return res.append("Content-Type", "text/html").send(unknownError)})

    return res.append("Content-Type", "text/html").send(success)
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