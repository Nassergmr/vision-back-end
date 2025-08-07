import express from "express";
import {
  GetPublishedimages,
  UpdateimageLikes,
  Updateimage,
  UpdateimageComments,
  GetImageLikes,
  GetImageComments,
} from "../controllers/imageController";

const imageRouter = express.Router();

imageRouter.get("/get-images", GetPublishedimages);
imageRouter.get("/get-likes/:id", GetImageLikes);
imageRouter.get("/get-comments/:id", GetImageComments);

imageRouter.post("/update-image", Updateimage);
imageRouter.post("/update-like", UpdateimageLikes);
imageRouter.post("/update-comments", UpdateimageComments);

export default imageRouter;
