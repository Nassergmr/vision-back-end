import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoute";
import mediaRouter from "./routes/mediaRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/vision/user", userRouter);
app.use("/vision/media", mediaRouter);

export default app;
