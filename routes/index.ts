import { Router } from "express";
const router = Router();
import auth from "./auth";
import discord from "./discord";


router.use("/auth", auth)
router.use("/discord", discord)

export default router