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
exports.DeleteCollection = exports.AddToCollection = exports.CreateUserCollection = exports.UploadImage = exports.EditCollection = exports.UserAvatarEdit = exports.UserprofileEdit = exports.GetCollections = exports.GetAllUsers = exports.UserProfilePublic = exports.GetPopularUserImages = exports.GetUserImages = exports.GetAdminDraftImages = exports.GetAdminPublishedImages = exports.GetAdminImages = exports.GetAdminCollection = exports.GetAdminCollections = exports.GetAdminDownloadedImages = exports.GetAdminLikedImages = exports.GetAdminLikes = exports.GetAdminAvatar = exports.GetAdminData = exports.SendUserMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const sendMessage_1 = require("../utils/sendMessage");
const userRoute_1 = require("../routes/userRoute");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
// Send the user message
exports.SendUserMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = req.body.sender;
    const reciever = req.body.reciever;
    const content = req.body.content;
    try {
        (0, sendMessage_1.SendMessage)(sender, reciever, content);
        res.status(200).json({
            message: "Message sent successfully!",
        });
    }
    catch (error) {
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin data
exports.GetAdminData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                images: { where: { isVisible: true } },
                collections: true,
                likes: true,
            },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin avatar
exports.GetAdminAvatar = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
            select: { avatar: true },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin likes
exports.GetAdminLikes = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
            select: { likes: true },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin liked images
exports.GetAdminLikedImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
        });
        const likedImages = yield prisma.image.findMany({
            where: {
                likes: {
                    some: {
                        userId: req.user.id,
                    },
                },
                isVisible: true,
            },
            include: { user: true, collections: true, comments: true },
            orderBy: { addedToLikedImages: "desc" },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        res.status(200).json(likedImages);
    }
    catch (error) {
        console.error("error:", error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin downloaded images
exports.GetAdminDownloadedImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const downloadedImages = yield prisma.image.findMany({
            where: {
                downloads: { some: { userId: req.user.id } },
                isVisible: true,
            },
            orderBy: { addedToDownloadedImages: "desc" },
            include: { user: true, collections: true, comments: true },
        });
        res.status(200).json({
            downloadedImages,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin collections
exports.GetAdminCollections = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const collections = yield prisma.collection.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                images: {
                    where: { isVisible: true },
                    include: { user: true },
                    orderBy: { addedToCollection: "asc" },
                },
            },
        });
        res.status(200).json(collections);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin single collection
exports.GetAdminCollection = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection = yield prisma.collection.findUnique({
            where: { id: req.params.id },
            include: {
                images: {
                    include: { user: true },
                    orderBy: { addedToCollection: "desc" },
                    where: { isVisible: true },
                },
            },
        });
        res.status(200).json(collection);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin images
exports.GetAdminImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const images = yield prisma.image.findMany({
            where: { userId: user.id, isVisible: true },
            orderBy: { addedAt: "desc" },
        });
        res.status(200).json(images);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin published images
exports.GetAdminPublishedImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const images = yield prisma.image.findMany({
            where: { userId: user.id, isVisible: true, published: true },
            orderBy: { addedAt: "desc" },
        });
        res.status(200).json(images);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get admin published images
exports.GetAdminDraftImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const images = yield prisma.image.findMany({
            where: { userId: user.id, isVisible: true, published: false },
            orderBy: { addedAt: "desc" },
        });
        res.status(200).json(images);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get user images
exports.GetUserImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const image = yield prisma.image.findMany({
            where: {
                userId: id,
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
/////////////////////////////////////////////////////////////////////////////////////
// Get most popular user images
exports.GetPopularUserImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const image = yield prisma.image.findMany({
            where: {
                userId: id,
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
/////////////////////////////////////////////////////////////////////////////////////
// Get user profile
exports.UserProfilePublic = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.params) === null || _a === void 0 ? void 0 : _a.slug)) {
            res.status(404).json({
                message: "No user Found",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { slug: req.params.slug },
            include: { images: true },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: error,
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get all users
exports.GetAllUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findMany({
            include: {
                likes: true,
            },
        });
        if (!user) {
            res.status(404).json({
                message: "No users found",
            });
            return;
        }
        res.status(200).json({
            message: "Users found",
            user,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Get collections
exports.GetCollections = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection = yield prisma.collection.findMany({
            include: {
                images: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        if (!collection) {
            res.status(404).json({
                message: "No collection found",
            });
            return;
        }
        res.status(200).json({
            message: "Collection Updated",
            collection,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Edit user profile
exports.UserprofileEdit = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, firstName, lastName, email, password, bio, location, website, facebook, instagram, youtube, tiktok, messageButtonAllowed, } = req.body;
    try {
        if (!((_a = req.body) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const user = yield prisma.user.update({
            where: { id: id },
            data: {
                firstName,
                lastName,
                email,
                password,
                bio,
                location,
                website,
                facebook,
                instagram,
                youtube,
                tiktok,
                messageButtonAllowed: messageButtonAllowed,
            },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("User info error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Edit the user avatar
exports.UserAvatarEdit = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({
                message: "No file uploaded",
            });
            return;
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const { filename } = req.file;
        const result = yield userRoute_1.cloudinary.api.resource(filename);
        yield prisma.user.update({
            where: { id: req.user.id },
            data: {
                avatar: result.public_id,
            },
        });
        res.status(200).json({
            message: "file uploaded successfully",
        });
    }
    catch (error) {
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Edit user collection
exports.EditCollection = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, title } = req.body;
        yield prisma.collection.update({
            where: { id: id },
            data: { title: title },
        });
        res.status(200).json({
            message: "collection updated successfully",
        });
    }
    catch (error) {
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Image upload
exports.UploadImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({
                message: "No image uploaded",
            });
            return;
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const { filename } = req.file;
        const result = yield userRoute_1.cloudinary.api.resource(filename);
        const image = yield prisma.image.create({
            data: {
                userId: user.id,
                title: req.body.title,
                location: req.body.location,
                tags: req.body.tags,
                height: result.height,
                public_id: result.public_id,
                width: result.width,
            },
        });
        res.status(200).json({
            message: "image uploaded successfully",
            data: image,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Create user collection and add image
exports.CreateUserCollection = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const userId = req.body.userId;
    const imageId = req.body.imageId;
    try {
        yield prisma.collection.create({
            data: {
                title: title,
                userId: userId,
                images: {
                    connect: [{ id: imageId }],
                },
            },
            include: {
                images: true,
                user: true,
            },
        });
        const date = new Date();
        yield prisma.image.update({
            where: {
                id: imageId,
            },
            data: { addedToCollection: date },
        });
        res.status(200).json({
            message: "Collection Updated",
        });
    }
    catch (error) {
        res.status(500).json({
            message: error,
        });
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Add image to an existing user collection
exports.AddToCollection = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.id;
    const imageId = req.body.imageId;
    try {
        const collectionExist = yield prisma.collection.findUnique({
            where: {
                id: id,
                images: {
                    some: { id: imageId },
                },
            },
        });
        if (collectionExist) {
            yield prisma.collection.update({
                where: {
                    id: id,
                },
                data: {
                    images: {
                        disconnect: {
                            id: imageId,
                        },
                    },
                },
            });
            res.status(200).json({
                message: "Image Removed Successfully From Collection",
            });
            return;
        }
        yield prisma.collection.update({
            where: {
                id: id,
            },
            data: {
                images: {
                    connect: [{ id: imageId }],
                },
            },
        });
        // Manually set the date to the image (mongodb sort them auto based on the addedAt field in the Image model)
        const date = new Date();
        yield prisma.image.update({
            where: {
                id: imageId,
            },
            data: { addedToCollection: date },
        });
        res.status(200).json({
            message: "Collection Updated",
        });
    }
    catch (error) {
        res.status(500).json({
            message: error,
        });
        console.error(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Delete collection
exports.DeleteCollection = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.collection.delete({
            where: { id },
        });
        res.status(200).json({
            message: "Collection Deleted",
        });
    }
    catch (error) {
        console.error(error);
    }
}));
