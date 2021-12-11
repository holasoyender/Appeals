import passport from "passport";
import Discord, {Profile} from "passport-discord";
import User from "../database/User";
import Mongoose from "mongoose";

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

if(process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
    passport.use(new Discord({
        clientID: process.env.CLIENT_ID.toString(),
        clientSecret: process.env.CLIENT_SECRET.toString(),
        callbackURL: "/api/auth/discord/redirect",
        scope: ["identify"]
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {

        try {
            let {id, username, discriminator, avatar} = profile;
            if(!avatar || avatar == "") avatar = "https://cdn.discordapp.com/embed/avatars/0.png";

            let user = await User.findOneAndUpdate({
                ID: id
            }, {
                Tag: `${username}#${discriminator}`,
                Avatar: avatar,
            }, {new: true})

            if (user) {
                return done(null, user)
            } else {
                const newUser = User.create({
                    _id: new Mongoose.Types.ObjectId(),
                    ID: id,
                    Tag: `${username}#${discriminator}`,
                    Avatar: avatar,
                })
                return done(null, newUser);
            }
        } catch (e) {
            console.log(e);
            return done(e, null)
        }

    }))
}