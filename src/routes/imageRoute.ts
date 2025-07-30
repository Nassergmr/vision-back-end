import express from "express";
import {
  GetAllPublishedimage,
  UpdateimageLikes,
  Updateimage,
  UpdateimageComments,
} from "../controllers/imageController";

const imageRouter = express.Router();

imageRouter.get("/get-image", GetAllPublishedimage);
imageRouter.post("/update-image", Updateimage);
imageRouter.post("/update-likes", UpdateimageLikes);
imageRouter.post("/update-comments", UpdateimageComments);

export default imageRouter;
