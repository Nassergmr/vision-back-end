import express from "express";
import {
  GetPublishedImages,
  UpdateImageLikes,
  UpdateimageComments,
  GetImageLikes,
  GetImageComments,
  UpdateImageViews,
  GetImageViews,
  GetImageDownloadsCount,
  UpdateImageDownloads,
  UpdateImageVisibility,
  GetImage,
  DeleteImage,
  GetPopularImages,
  UpdateImageOptimisation,
} from "../controllers/imageController";

const imageRouter = express.Router();

imageRouter.get("/get-image/:id", GetImage);
imageRouter.get("/get-images", GetPublishedImages);
imageRouter.get("/get-popular-images", GetPopularImages);
imageRouter.get("/get-likes/:id", GetImageLikes);
imageRouter.get("/get-comments/:id", GetImageComments);
imageRouter.get("/get-views/:id", GetImageViews);
imageRouter.get("/get-downloads-count/:id", GetImageDownloadsCount);

imageRouter.post("/update-image", UpdateImageVisibility);
imageRouter.patch("/update-optimisation", UpdateImageOptimisation);
imageRouter.post("/update-like", UpdateImageLikes);
imageRouter.post("/update-comments", UpdateimageComments);
imageRouter.post("/update-views", UpdateImageViews);
imageRouter.post("/update-downloads", UpdateImageDownloads);

imageRouter.patch("/delete-image/:id", DeleteImage);

export default imageRouter;
