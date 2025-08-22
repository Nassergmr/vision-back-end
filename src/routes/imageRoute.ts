import express from "express";
import {
  GetPublishedimages,
  UpdateImageLikes,
  Updateimage,
  UpdateimageComments,
  GetImageLikes,
  GetImageComments,
  UpdateImageViews,
  GetImageViews,
  GetImageDownloadsCount,
  UpdateImageDownloads,
} from "../controllers/imageController";

const imageRouter = express.Router();

imageRouter.get("/get-images", GetPublishedimages);
imageRouter.get("/get-likes/:id", GetImageLikes);
imageRouter.get("/get-comments/:id", GetImageComments);
imageRouter.get("/get-views/:id", GetImageViews);
imageRouter.get("/get-downloads-count/:id", GetImageDownloadsCount);

imageRouter.post("/update-image", Updateimage);
imageRouter.post("/update-like", UpdateImageLikes);
imageRouter.post("/update-comments", UpdateimageComments);
imageRouter.post("/update-views", UpdateImageViews);
imageRouter.post("/update-downloads", UpdateImageDownloads);

export default imageRouter;
