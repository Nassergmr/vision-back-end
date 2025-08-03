import express from "express";
import {
  GetPublishedimages,
  UpdateimageLikes,
  Updateimage,
  UpdateimageComments,
  GetImageLikes,
} from "../controllers/imageController";

const imageRouter = express.Router();

imageRouter.get("/get-images", GetPublishedimages);
imageRouter.get("/get-likes", GetImageLikes);

imageRouter.post("/update-image", Updateimage);
imageRouter.post("/update-like", UpdateimageLikes);
imageRouter.post("/update-comments", UpdateimageComments);

export default imageRouter;
