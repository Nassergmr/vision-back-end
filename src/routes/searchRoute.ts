import express from "express";
import { GetSearchImages } from "../controllers/searchController";

const searchRouter = express.Router();

searchRouter.get("/get-searched-images/:query", GetSearchImages);

export default searchRouter;
