import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoute";
import imageRouter from "./routes/imageRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/vision/user", userRouter);
app.use("/vision/image", imageRouter);

export default app;
