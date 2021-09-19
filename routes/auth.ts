import { Router } from "express";
const router = Router();
import * as passport from "passport";


router.get("/discord", passport.authenticate("discord"));

router.get("/discord/redirect", passport.authenticate("discord"), (req, res) => {
    res.send("OK")
})

export default router