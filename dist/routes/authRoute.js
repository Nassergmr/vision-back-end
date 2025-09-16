"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authRouter = express_1.default.Router();
authRouter.get("/verify-email", authController_1.VerifyUser);
authRouter.post("/send-reset-password-mail", authController_1.SendResetPasswordMail);
authRouter.post("/register", authController_1.RegisterUser);
authRouter.post("/login", authController_1.LoginUser);
authRouter.patch("/update-password", authController_1.UpdateUserPassword);
authRouter.patch("/change-password", authController_1.ChangeUserPassword);
exports.default = authRouter;
