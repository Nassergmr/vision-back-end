import express from "express";
import { validateToken } from "../middlewares/tokenValidationHandler";
import {
  GetAdminData,
  GetAdminLikes,
  GetAdminCollections,
  GetAllUsers,
  GetCollections,
  UploadImage,
  UserProfilePublic,
  UserprofileEdit,
  UserAvatarEdit,
  CreateUserCollection,
  AddToCollection,
  SendUserMessage,
  GetAdminImages,
  GetUserImages,
  GetAdminCollection,
  GetAdminLikedImages,
  DeleteCollection,
  EditCollection,
  GetAdminDownloadedImages,
  GetPopularUserImages,
  GetAdminAvatar,
  GetAdminDraftImages,
  GetAdminPublishedImages,
} from "../controllers/userController";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";

const userRouter = express.Router();

// Multer configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => ({
    folder: "user-uploads",
    format: file.mimetype.split("/")[1],
    allowed_formats: ["jpg", "png", "jpeg"],
  }),
});

const upload = multer({ storage });

userRouter.get("/get-users", GetAllUsers);
userRouter.get("/profile/:slug", UserProfilePublic);
userRouter.get("/get-user-images/:id", GetUserImages);
userRouter.get("/get-user-popular-images/:id", GetPopularUserImages);
userRouter.get("/get-collections", GetCollections);
userRouter.get("/get-admin-data", validateToken, GetAdminData);
userRouter.get("/get-admin-images", validateToken, GetAdminImages);
userRouter.get(
  "/get-admin-published-images",
  validateToken,
  GetAdminPublishedImages
);
userRouter.get("/get-admin-draft-images", validateToken, GetAdminDraftImages);

userRouter.get("/get-admin-avatar", validateToken, GetAdminAvatar);
userRouter.get("/get-admin-likes", validateToken, GetAdminLikes);
userRouter.get("/get-admin-liked-images", validateToken, GetAdminLikedImages);
userRouter.get(
  "/get-admin-downloaded-images",
  validateToken,
  GetAdminDownloadedImages
);
userRouter.get("/get-admin-collections", validateToken, GetAdminCollections);
userRouter.get("/get-admin-collection/:id", GetAdminCollection);

userRouter.post("/upload", validateToken, upload.single("image"), UploadImage);
userRouter.post("/create-collection", CreateUserCollection);
userRouter.post("/update-collection", AddToCollection);
userRouter.post("/send-message", SendUserMessage);

userRouter.patch("/edit-collection", EditCollection);
userRouter.patch("/edit-profile", UserprofileEdit);
userRouter.patch(
  "/edit-avatar",
  validateToken,
  upload.single("avatar"),
  UserAvatarEdit
);

userRouter.delete("/delete-collection/:id", DeleteCollection);

export default userRouter;
export { cloudinary };
