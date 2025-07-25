import express from "express";
import {
  GetAllMedia,
  UpdateLikes,
  UpdateMedia,
} from "../controllers/mediaController";

const mediaRouter = express.Router();

mediaRouter.get("/get-media", GetAllMedia);
mediaRouter.post("/update-media", UpdateMedia);
mediaRouter.post("/update-likes", UpdateLikes);

export default mediaRouter;
