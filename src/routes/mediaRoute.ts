import express from "express";
import { GetAllMedia, UpdateMedia } from "../controllers/mediaController";

const mediaRouter = express.Router();

mediaRouter.get("/get-media", GetAllMedia);
mediaRouter.post("/update-media", UpdateMedia);

export default mediaRouter;
