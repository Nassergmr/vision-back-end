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
exports.DeleteImage = exports.UpdateImageDownloads = exports.UpdateImageViews = exports.UpdateimageComments = exports.UpdateImageLikes = exports.UpdateImageVisibility = exports.GetImageDownloadsCount = exports.GetImageViews = exports.GetImageComments = exports.GetImageLikes = exports.GetPopularImages = exports.GetPublishedImages = exports.GetImage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
// Get Image
exports.GetImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const image = yield prisma.image.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                user: true,
            },
        });
        if (!image) {
            res.status(404).json({
                message: "No image found",
            });
            return;
        }
        res.status(200).json({
            message: "image found",
            image,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Get published images
exports.GetPublishedImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const image = yield prisma.image.findMany({
            where: {
                published: true,
                isVisible: true,
            },
            orderBy: { addedAt: "desc" },
            include: {
                user: true,
            },
        });
        if (!image) {
            res.status(404).json({
                message: "No image found",
            });
            return;
        }
        res.status(200).json({
            message: "image found",
            image,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Get popular images
exports.GetPopularImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const image = yield prisma.image.findMany({
            where: {
                published: true,
                isVisible: true,
            },
            orderBy: [
                { likesCount: "desc" },
                { downloadsCount: "desc" },
                { views: "desc" },
            ],
            include: {
                user: true,
            },
        });
        if (!image) {
            res.status(404).json({
                message: "No image found",
            });
            return;
        }
        res.status(200).json({
            message: "image found",
            image,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Get image likes
exports.GetImageLikes = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = req.params.id;
    try {
        const image = yield prisma.image.findUnique({
            where: { id: imageId },
            select: { likes: true },
        });
        if (!image) {
            res.status(404).json({
                message: "No image found",
            });
            return;
        }
        res.status(200).json({
            image,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Get image comments
exports.GetImageComments = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = req.params.id;
    try {
        const comments = yield prisma.comment.findMany({
            where: { imageId: imageId },
            include: { user: true },
            orderBy: { createdAt: "asc" },
        });
        res.status(200).json({
            comments,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Get image views
exports.GetImageViews = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = req.params.id;
    try {
        const views = yield prisma.image.findUnique({
            where: { id: imageId },
            select: { views: true },
        });
        res.status(200).json({
            views,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Get image downloads count
exports.GetImageDownloadsCount = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = req.params.id;
    try {
        const downloadsCount = yield prisma.image.findUnique({
            where: { id: imageId },
            select: { downloadsCount: true },
        });
        res.status(200).json({
            downloadsCount,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Update image visibility (draft --> published || published --> draft)
exports.UpdateImageVisibility = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = req.body.id;
    try {
        const isDraft = yield prisma.image.findUnique({
            where: {
                id: imageId,
                AND: {
                    published: false,
                },
            },
        });
        if (isDraft) {
            yield prisma.image.update({
                where: {
                    id: imageId,
                },
                data: {
                    published: true,
                },
            });
            res.status(200).json({
                message: "Published Successfully",
            });
            return;
        }
        else {
            yield prisma.image.update({
                where: { id: imageId },
                data: { published: false },
            });
        }
        if (!imageId) {
            res.status(404).json({
                message: "No image found",
            });
            return;
        }
        res.status(200).json({
            message: "Published Successfully",
            imageId,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Update image likes
exports.UpdateImageLikes = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = req.body.imageId;
    const imageUrl = req.body.imageUrl;
    const userId = req.body.userId;
    const liked = yield prisma.like.findUnique({
        where: {
            userId_imageId: {
                imageId: imageId,
                userId: userId,
            },
        },
    });
    try {
        if (liked) {
            yield prisma.like.delete({
                where: {
                    userId_imageId: {
                        imageId: imageId,
                        userId: userId,
                    },
                },
            });
            yield prisma.image.update({
                where: { id: imageId },
                data: { likesCount: { decrement: 1 } },
            });
            res.status(200).json({
                message: "Image Unliked Successfully",
            });
            return;
        }
        const likes = yield prisma.like.create({
            data: {
                imageId: imageId,
                imageUrl: imageUrl,
                userId: userId,
            },
        });
        const date = new Date();
        yield prisma.image.update({
            where: { id: imageId },
            data: { likesCount: { increment: 1 }, addedToLikedImages: date },
        });
        if (!likes) {
            res.status(404).json({
                message: "No likes found",
            });
            return;
        }
        res.status(200).json({
            message: "Image Updated Successfully",
            likes,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Update image comments
exports.UpdateimageComments = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const content = req.body.content;
    const imageId = req.body.imageId;
    const imageUrl = req.body.imageUrl;
    const userId = req.body.userId;
    try {
        const comment = yield prisma.comment.create({
            data: {
                content: content,
                imageId: imageId,
                imageUrl: imageUrl,
                userId: userId,
            },
        });
        if (!comment) {
            res.status(404).json({
                message: "No comment found",
            });
            return;
        }
        res.status(200).json({
            message: "Comment Updated",
            comment,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Update image views
exports.UpdateImageViews = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = req.body.imageId;
    try {
        const image = yield prisma.image.update({
            where: { id: imageId },
            data: {
                views: { increment: 1 },
            },
        });
        if (!image) {
            res.status(404).json({
                message: "No image found",
            });
            return;
        }
        res.status(200).json({
            message: "Image Updated",
            image,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Update image downloads
exports.UpdateImageDownloads = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageId = req.body.imageId;
    const userId = req.body.userId;
    try {
        const image = yield prisma.image.update({
            where: { id: imageId },
            data: {
                downloadsCount: { increment: 1 },
            },
        });
        if (userId) {
            const downloaded = yield prisma.download.findUnique({
                where: {
                    userId_imageId: {
                        imageId: imageId,
                        userId: userId,
                    },
                },
            });
            if (downloaded) {
                res.status(400).json({
                    message: "image already downloaded",
                });
                return;
            }
            const downloadedImage = yield prisma.download.create({
                data: { imageId: imageId, userId: userId },
            });
            const date = new Date();
            yield prisma.image.update({
                where: { id: imageId },
                data: { addedToDownloadedImages: date },
            });
            if (!image) {
                res.status(404).json({
                    message: "No image found",
                });
                return;
            }
            res.status(200).json({
                message: "Image Updated",
                image,
                downloadedImage,
            });
        }
    }
    catch (error) {
        console.error(error);
    }
}));
//////////////////////////////////////////////////////////////////////////////
// Delete image
exports.DeleteImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const image = yield prisma.image.update({
            where: { id },
            data: {
                isVisible: false,
            },
        });
        if (!image) {
            res.status(404).json({
                message: "No image found",
            });
            return;
        }
        res.status(200).json({
            message: "Image Deleted",
            image,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
