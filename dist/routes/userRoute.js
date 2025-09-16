"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
const express_1 = __importDefault(require("express"));
const tokenValidationHandler_1 = require("../middlewares/tokenValidationHandler");
const userController_1 = require("../controllers/userController");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const userRouter = express_1.default.Router();
// Multer configuration
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            folder: "user-uploads",
            format: file.mimetype.split("/")[1],
            allowed_formats: ["jpg", "png", "jpeg"],
        });
    }),
});
const upload = (0, multer_1.default)({ storage });
userRouter.get("/get-users", userController_1.GetAllUsers);
userRouter.get("/profile/:slug", userController_1.UserProfilePublic);
userRouter.get("/get-user-images/:id", userController_1.GetUserImages);
userRouter.get("/get-user-popular-images/:id", userController_1.GetPopularUserImages);
userRouter.get("/get-collections", userController_1.GetCollections);
userRouter.get("/get-admin-data", tokenValidationHandler_1.validateToken, userController_1.GetAdminData);
userRouter.get("/get-admin-images", tokenValidationHandler_1.validateToken, userController_1.GetAdminImages);
userRouter.get("/get-admin-published-images", tokenValidationHandler_1.validateToken, userController_1.GetAdminPublishedImages);
userRouter.get("/get-admin-draft-images", tokenValidationHandler_1.validateToken, userController_1.GetAdminDraftImages);
userRouter.get("/get-admin-avatar", tokenValidationHandler_1.validateToken, userController_1.GetAdminAvatar);
userRouter.get("/get-admin-likes", tokenValidationHandler_1.validateToken, userController_1.GetAdminLikes);
userRouter.get("/get-admin-liked-images", tokenValidationHandler_1.validateToken, userController_1.GetAdminLikedImages);
userRouter.get("/get-admin-downloaded-images", tokenValidationHandler_1.validateToken, userController_1.GetAdminDownloadedImages);
userRouter.get("/get-admin-collections", tokenValidationHandler_1.validateToken, userController_1.GetAdminCollections);
userRouter.get("/get-admin-collection/:id", userController_1.GetAdminCollection);
userRouter.post("/upload", tokenValidationHandler_1.validateToken, upload.single("image"), userController_1.UploadImage);
userRouter.post("/create-collection", userController_1.CreateUserCollection);
userRouter.post("/update-collection", userController_1.AddToCollection);
userRouter.post("/send-message", userController_1.SendUserMessage);
userRouter.patch("/edit-collection", userController_1.EditCollection);
userRouter.patch("/edit-profile", userController_1.UserprofileEdit);
userRouter.patch("/edit-avatar", tokenValidationHandler_1.validateToken, upload.single("avatar"), userController_1.UserAvatarEdit);
userRouter.delete("/delete-collection/:id", userController_1.DeleteCollection);
exports.default = userRouter;
