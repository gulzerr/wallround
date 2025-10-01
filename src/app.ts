import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { errors as celebrateErrors } from "celebrate";
import morganBody from "morgan-body";
import filterCtrl from "./controllers/user/user-filter";
import commonCtrl from "./controllers/common/index";

const app = express();

app.use(bodyParser.json());
morganBody(app, {
  prettify: false,
});

app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/", commonCtrl);
app.use("/users", filterCtrl);

app.use(celebrateErrors());
export default app;
