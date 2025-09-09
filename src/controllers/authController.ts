import expressAsyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { SendMail } from "../utils/sendMail";

const prisma = new PrismaClient();
dotenv.config();

// Register the user
export const RegisterUser = expressAsyncHandler(async (req, res) => {
  const { userFirstName, userLastName, userEmail, userPassword } = req.body;

  if (!userFirstName || !userLastName || !userEmail || !userPassword) {
    res.status(400).json({
      message: "All fields are required",
    });
    return;
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (userExists) {
      res.status(409).json({
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const verificationToken = crypto.randomBytes(64).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

    const user = await prisma.user.create({
      data: {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        password: hashedPassword,
        verificationToken: verificationToken,
        verificationTokenExpiry: verificationTokenExpiry,
      },
    });

    res.status(201).json({
      message: "User created successfully (non verified)",
    });

    SendMail(userEmail, verificationToken);
    console.log("User created:", user);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Verify the user email
export const VerifyUser = expressAsyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).json({ message: "Invalid verification token" });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
    },
  });

  if (!user) {
    res.status(404).json({ message: "Invalid or expired token" });
  }

  if (
    user &&
    user.verificationTokenExpiry &&
    user.verificationTokenExpiry < new Date()
  ) {
    res.status(400).json({ message: "Token expired" });
  }

  {
    user &&
      (await prisma.user.update({
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
    const accessToken = jwt.sign(
      {
        user: {
          id: user.id,
          email: user.email,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

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
});

/////////////////////////////////////////////////////////////////////////////////////

// Log in the user
export const LoginUser = expressAsyncHandler(async (req, res) => {
  const { userEmail, userPassword } = req.body;

  if (!userEmail || !userPassword) {
    res.status(400).json({
      message: "All fields are required",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
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

    const passwordMatch = await bcrypt.compare(userPassword, user.password);
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

    const accessToken = jwt.sign(
      {
        user: {
          id: user.id,
          email: user.email,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});
