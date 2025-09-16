import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import imageRouter from "./routes/imageRoute";
import searchRouter from "./routes/searchRoute";

const app = express();

app.use(
  cors({
    origin: "https://vision-platform.vercel.app",
    credentials: true,
  })
);

app.use(express.json());

app.use("/vision/auth", authRouter);
app.use("/vision/user", userRouter);
app.use("/vision/image", imageRouter);
app.use("/vision/search", searchRouter);

export default app;
