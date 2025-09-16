"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const imageRoute_1 = __importDefault(require("./routes/imageRoute"));
const searchRoute_1 = __importDefault(require("./routes/searchRoute"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/vision/auth", authRoute_1.default);
app.use("/vision/user", userRoute_1.default);
app.use("/vision/image", imageRoute_1.default);
app.use("/vision/search", searchRoute_1.default);
exports.default = app;
