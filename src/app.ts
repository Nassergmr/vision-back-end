import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoute";
import imageRouter from "./routes/imageRoute";
import searchRouter from "./routes/searchRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/vision/user", userRouter);
app.use("/vision/image", imageRouter);
app.use("/vision/search", searchRouter);

export default app;
