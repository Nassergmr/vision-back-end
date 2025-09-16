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
exports.GetSearchImages = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
exports.GetSearchImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = req.params.query;
    try {
        const response = (yield prisma.$runCommandRaw({
            aggregate: "Image",
            pipeline: [
                {
                    $search: {
                        index: "default",
                        text: {
                            query: String(query),
                            path: ["title", "location", "tags"],
                            fuzzy: {
                                maxEdits: 2,
                                prefixLength: 1,
                            },
                        },
                    },
                },
                { $limit: 20 },
                { $project: { _id: 1 } },
            ],
            cursor: {},
        }));
        const ids = (_a = response.cursor) === null || _a === void 0 ? void 0 : _a.firstBatch.map((doc) => doc._id.$oid);
        if (!ids || ids.length === 0) {
            res.status(200).json({ results: [] });
            return;
        }
        const results = yield prisma.image.findMany({
            where: { id: { in: ids }, published: true, isVisible: true },
            include: {
                user: true,
                likes: true,
                downloads: true,
            },
        });
        res.status(200).json({ results });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Search failed" });
    }
}));
