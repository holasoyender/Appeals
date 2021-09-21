import * as passport from "passport";
import * as Discord from "passport-discord";
import User from "../database/User";
import * as Mongoose from "mongoose";

passport.serializeUser(async (user:any, done) => {
    let usr = await user;
    done(null, await usr.ID)
})
passport.deserializeUser(async (ID, done) => {
    try {
        let user = await User.findOne({ID});
        return user ? done(null,user) : done(null, null);
    }catch (e) {
        console.log(e);
        done(e,null);
    }
})
passport.use(new Discord({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/api/auth/discord/redirect",
    scope: ["identify", "guilds"]
}, async (accessToken, refreshToken, profile, done) => {

    try {
        const {id, username, discriminator, avatar, guilds} = profile;

        let user = await User.findOneAndUpdate({
            ID: id
        }, {
            Tag: `${username}#${discriminator}`,
            Avatar: avatar,
            Guilds: guilds
        }, {new: true})

        if (user) {
            return done(null, user)
        } else {
            const newUser = User.create({
                _id: new Mongoose.Types.ObjectId(),
                ID: id,
                Tag: `${username}#${discriminator}`,
                Avatar: avatar,
                Guilds: guilds
            })
            return done(null, newUser);
        }
    } catch (e) {
        console.log(e);
        return done(e, null)
    }

}))