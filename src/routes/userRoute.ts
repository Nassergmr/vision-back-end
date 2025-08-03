import express from "express";
import { validateToken } from "../middlewares/tokenValidationHandler";
import {
  VerifyUser,
  LoginUser,
  RegisterUser,
  AdminDashboard,
  Uploadimage,
  GetAllUsers,
  UserProfilePublic,
  UserProfileEdit,
  UserAvatarEdit,
  CreateUserCollection,
  GetUserCollections,
  AddToCollection,
  SendUserMessage,
  UserFollow,
  AdminLikes,
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
userRouter.get("/dashboard", validateToken, AdminDashboard);
userRouter.get("/admin-likes", validateToken, AdminLikes);
userRouter.get("/get-collections", GetUserCollections);

userRouter.post("/register", RegisterUser);
userRouter.post("/login", LoginUser);
userRouter.post("/upload", validateToken, upload.single("image"), Uploadimage);
userRouter.post("/create-collection", CreateUserCollection);
userRouter.post("/update-collection", AddToCollection);
userRouter.post("/send-message", SendUserMessage);
userRouter.post("/follow-user", UserFollow);

userRouter.patch("/profile-edit", UserProfileEdit);
userRouter.patch(
  "/avatar-edit",
  validateToken,
  upload.single("avatar"),
  UserAvatarEdit
);

export default userRouter;
