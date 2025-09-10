import express from "express";
import {
  LoginUser,
  RegisterUser,
  SendResetPasswordMail,
  UpdateUserPassword,
  VerifyUser,
} from "../controllers/authController";

const authRouter = express.Router();

authRouter.get("/verify-email", VerifyUser);

authRouter.post("/send-reset-password-mail", SendResetPasswordMail);
authRouter.post("/register", RegisterUser);
authRouter.post("/login", LoginUser);

authRouter.patch("/update-password", UpdateUserPassword);
export default authRouter;
