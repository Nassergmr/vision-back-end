import express from "express";
import {
  GetAllPublishedMedia,
  UpdateMediaLikes,
  UpdateMedia,
  UpdateMediaComments,
} from "../controllers/mediaController";

const mediaRouter = express.Router();

mediaRouter.get("/get-media", GetAllPublishedMedia);
mediaRouter.post("/update-media", UpdateMedia);
mediaRouter.post("/update-likes", UpdateMediaLikes);
mediaRouter.post("/update-comments", UpdateMediaComments);

export default mediaRouter;
