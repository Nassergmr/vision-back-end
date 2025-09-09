import express from "express";
import {
  LoginUser,
  RegisterUser,
  VerifyUser,
} from "../controllers/authController";

const authRouter = express.Router();

authRouter.get("/verify-email", VerifyUser);
authRouter.post("/register", RegisterUser);
authRouter.post("/login", LoginUser);

export default authRouter;
