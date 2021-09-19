// https://www.youtube.com/watch?v=DomtnrQ4f3Q

import * as express from "express";
import { config } from "dotenv";
import router from "./routes";
config()

const app = express();
const PORT = process.env.PORT || 4001;

app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto: ${PORT}`)
})