import express from "express";
import { validateToken } from "../middlewares/tokenValidationHandler";
import {
  VerifyUser,
  LoginUser,
  RegisterUser,
  GetAdminData,
  GetAdminLikes,
  GetAdminCollections,
  GetAllUsers,
  GetCollections,
  Uploadimage,
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
} from "../controllers/userController";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const userRouter = express.Router();

// Multer configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "user-uploads",
    format: file.mimetype.split("/")[1],
    allowed_formats: ["jpg", "png", "jpeg"],
  }),
});

const upload = multer({ storage });

userRouter.get("/verify-email", VerifyUser);
userRouter.get("/get-users", GetAllUsers);
userRouter.get("/profile/:id", UserProfilePublic);
userRouter.get("/get-user-images/:id", GetUserImages);
userRouter.get("/get-user-popular-images/:id", GetPopularUserImages);
userRouter.get("/get-collections", GetCollections);
userRouter.get("/get-admin-data", validateToken, GetAdminData);
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
userRouter.get("/get-admin-images", validateToken, GetAdminImages);

userRouter.post("/register", RegisterUser);
userRouter.post("/login", LoginUser);
userRouter.post("/upload", validateToken, upload.single("image"), Uploadimage);
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
