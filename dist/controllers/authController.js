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
exports.ChangeUserPassword = exports.UpdateUserPassword = exports.SendResetPasswordMail = exports.LoginUser = exports.VerifyUser = exports.RegisterUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const sendVerificationMail_1 = require("../utils/sendVerificationMail");
const sendResetMail_1 = require("../utils/sendResetMail");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
// Register the user
exports.RegisterUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userFirstName, userLastName, userEmail, userPassword } = req.body;
    if (!userFirstName || !userLastName || !userEmail || !userPassword) {
        res.status(400).json({
            message: "All fields are required",
        });
        return;
    }
    try {
        const userExists = yield prisma.user.findUnique({
            where: { email: userEmail },
        });
        if (userExists) {
            res.status(409).json({
                message: "User already exists, log in instead",
            });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(userPassword, 10);
        const verificationToken = crypto_1.default.randomBytes(64).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);
        const user = yield prisma.user.create({
            data: {
                firstName: userFirstName,
                lastName: userLastName,
                email: userEmail,
                slug: "",
                password: hashedPassword,
                verificationToken: verificationToken,
                verificationTokenExpiry: verificationTokenExpiry,
            },
        });
        const userId = yield prisma.user.findFirst({
            where: { email: userEmail },
        });
        const shortId = userId === null || userId === void 0 ? void 0 : userId.id.slice(0, 6);
        const slug = `${userFirstName.toLowerCase()}-${shortId}`;
        yield prisma.user.update({
            where: {
                email: userEmail,
            },
            data: {
                slug: slug,
            },
        });
        res.status(201).json({
            message: "User created successfully (non verified)",
        });
        (0, sendVerificationMail_1.SendVerificationMail)(userEmail, verificationToken);
        console.log("User created:", user);
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Verify the user email
exports.VerifyUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        res.status(400).json({ message: "Invalid verification token" });
        return;
    }
    const user = yield prisma.user.findFirst({
        where: {
            verificationToken: token,
        },
    });
    if (!user) {
        res.status(404).json({ message: "Invalid or expired token" });
    }
    if (user &&
        user.verificationTokenExpiry &&
        user.verificationTokenExpiry < new Date()) {
        res.status(400).json({ message: "Token expired" });
    }
    {
        user &&
            (yield prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verificationToken: null,
                    verificationTokenExpiry: null,
                },
            }));
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("JWT token secret not defined");
        res.status(500).json({
            message: "Internal server error",
        });
        return;
    }
    if (user) {
        const accessToken = jsonwebtoken_1.default.sign({
            user: {
                id: user.id,
                email: user.email,
            },
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30d" });
        res.status(200).json({
            message: "Email verified successfully",
            accessToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Log in the user
exports.LoginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userEmail, userPassword } = req.body;
    if (!userEmail || !userPassword) {
        res.status(400).json({
            message: "All fields are required",
        });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { email: userEmail },
        });
        if (!user || !user.password) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }
        if (user.isVerified === false) {
            res.status(500).json({
                message: "Verify your email",
            });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(userPassword, user.password);
        if (!passwordMatch) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error("JWT token secret not defined");
            res.status(500).json({
                message: "Internal server error",
            });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({
            user: {
                id: user.id,
                email: user.email,
            },
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30d" });
        res.status(200).json({
            message: "Logged in successfully",
            accessToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Send password reset link to the user
exports.SendResetPasswordMail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userEmail } = req.body;
    if (!userEmail) {
        res.status(400).json({
            message: "All fields are required",
        });
        return;
    }
    try {
        const verificationToken = crypto_1.default.randomBytes(64).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);
        const user = yield prisma.user.update({
            where: { email: userEmail },
            data: {
                email: userEmail,
                verificationToken: verificationToken,
                verificationTokenExpiry: verificationTokenExpiry,
            },
        });
        console.log("User updated:", user);
        res.status(201).json({
            message: "Mail sent successfully",
        });
        (0, sendResetMail_1.SendResetMail)(userEmail, verificationToken);
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////
// Update user password (Forgot password)
exports.UpdateUserPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        res.status(400).json({ message: "Invalid verification token" });
        return;
    }
    const user = yield prisma.user.findFirst({
        where: {
            verificationToken: token,
        },
    });
    if (!user) {
        res.status(404).json({ message: "Invalid or expired token" });
    }
    if (user &&
        user.verificationTokenExpiry &&
        user.verificationTokenExpiry < new Date()) {
        res.status(400).json({ message: "Token expired" });
    }
    const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
    {
        user &&
            (yield prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    verificationToken: null,
                    verificationTokenExpiry: null,
                },
            }));
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("JWT token secret not defined");
        res.status(500).json({
            message: "Internal server error",
        });
        return;
    }
    res.status(200).json({
        message: "Password updated successfully",
    });
}));
/////////////////////////////////////////////////////////////////////////////////////
// Change user password (Change password from settings)
exports.ChangeUserPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, currentPassword, newPassword } = req.body;
    const user = yield prisma.user.findFirst({
        where: {
            email: email,
        },
    });
    if (!user) {
        res.status(404).json({ message: "No user found" });
    }
    if (user) {
        const passwordMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!passwordMatch) {
            res.status(401).json({
                message: "Your password is incorrect",
            });
            return;
        }
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    user &&
        (yield prisma.user.update({
            where: { email: email },
            data: {
                password: hashedPassword,
            },
        }));
    res.status(200).json({
        message: "Password updated successfully",
    });
}));
