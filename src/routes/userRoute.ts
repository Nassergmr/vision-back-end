import express from "express";
import { validateToken } from "../middlewares/tokenValidationHandler";
import {
  VerifyUser,
  LoginUser,
  RegisterUser,
  UserInfo,
  UploadFile,
  GetAllUsers,
  UserProfile,
  UserUpdates,
  UserAvatarUpdate,
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
userRouter.get("/user-profile/:id", UserProfile);
userRouter.get("/user-info", validateToken, UserInfo);
userRouter.post("/register", RegisterUser);
userRouter.post("/login", LoginUser);
userRouter.post("/upload", validateToken, upload.single("file"), UploadFile);
userRouter.patch("/user-update", UserUpdates);
userRouter.patch(
  "/user-avatar-update",
  validateToken,
  upload.single("file"),
  UserAvatarUpdate
);

export default userRouter;
