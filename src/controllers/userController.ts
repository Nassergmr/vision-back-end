import expressAsyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request } from "express";
import crypto from "crypto";
import { SendMail } from "../utils/sendMail";
import { SendMessage } from "../utils/sendMessage";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

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

/////////////////////////////////////////////////////////////////////////////////////

// Send the user message
export const SendUserMessage = expressAsyncHandler(async (req, res) => {
  const sender = req.body.sender;
  const reciever = req.body.reciever;
  const content = req.body.content;

  try {
    SendMessage(sender, reciever, content);
    res.status(200).json({
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Get admin data
export const GetAdminData = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      const user = await prisma.user.findUnique({
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
    } catch (error) {
      console.error("User info error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

/////////////////////////////////////////////////////////////////////////////////////

// Get admin likes
export const GetAdminLikes = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      const user = await prisma.user.findUnique({
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
    } catch (error) {
      console.error("User info error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

/////////////////////////////////////////////////////////////////////////////////////

// Get admin liked images
export const GetAdminLikedImages = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      const likedImages = await prisma.image.findMany({
        where: {
          likes: {
            some: {
              userId: req.user.id,
            },
          },
          isVisible: true,
        },
        include: { user: true, collections: true, comments: true },
      });

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      res.status(200).json(likedImages);
    } catch (error) {
      console.error("error:", error);
    }
  }
);

/////////////////////////////////////////////////////////////////////////////////////

// Get admin downloaded images
export const GetAdminDownloadedImages = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      const downloadedImages = await prisma.image.findMany({
        where: {
          downloads: { some: { userId: req.user.id } },
          isVisible: true,
        },
        include: { user: true, collections: true, comments: true },
      });

      res.status(200).json({
        downloadedImages,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

/////////////////////////////////////////////////////////////////////////////////////

// Get admin collections
export const GetAdminCollections = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }
      const collections = await prisma.collection.findMany({
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
    } catch (error) {
      console.error("User info error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

/////////////////////////////////////////////////////////////////////////////////////

// Get admin single collection
export const GetAdminCollection = expressAsyncHandler(async (req, res) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: req.params.id },
      include: {
        images: {
          include: { user: true },
          orderBy: { addedToCollection: "asc" },
          where: { isVisible: true },
        },
      },
    });

    res.status(200).json(collection);
  } catch (error) {
    console.error("User info error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Get admin images
export const GetAdminImages = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }
      const images = await prisma.image.findMany({
        where: { userId: user.id, isVisible: true },
        orderBy: { addedAt: "desc" },
      });

      res.status(200).json(images);
    } catch (error) {
      console.error("User info error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

/////////////////////////////////////////////////////////////////////////////////////

// Get user images
export const GetUserImages = expressAsyncHandler(async (req, res) => {
  const id = req.params.id;

  try {
    const image = await prisma.image.findMany({
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
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Get most popular user images
export const GetPopularUserImages = expressAsyncHandler(async (req, res) => {
  const id = req.params.id;

  try {
    const image = await prisma.image.findMany({
      where: {
        userId: id,
        published: true,
        isVisible: true,
      },
      orderBy: { likesCount: "desc" },
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
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Get user profile (public)
export const UserProfilePublic = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.params?.id) {
      res.status(404).json({
        message: "No user Found",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { images: true },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("User info error:", error);
    res.status(500).json({
      message: error,
    });
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Get all users
export const GetAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    const user = await prisma.user.findMany({
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
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Get collections
export const GetCollections = expressAsyncHandler(async (req, res) => {
  try {
    const collection = await prisma.collection.findMany({
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
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Edit user profile
export const UserprofileEdit = expressAsyncHandler(async (req, res) => {
  const {
    id,
    firstName,
    lastName,
    bio,
    location,
    website,
    facebook,
    instagram,
    youtube,
    tiktok,
    messageButtonAllowed,
  } = req.body;

  try {
    if (!req.body?.id) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: id },
      data: {
        firstName,
        lastName,
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
  } catch (error) {
    console.error("User info error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Edit the user avatar
export const UserAvatarEdit = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        message: "No file uploaded",
      });
      return;
    }

    if (!req.user?.id) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatar: req.file.path,
      },
    });

    res.status(200).json({
      message: "file uploaded successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Edit user collection
export const EditCollection = expressAsyncHandler(async (req, res) => {
  try {
    const { id, title } = req.body;
    await prisma.collection.update({
      where: { id: id },
      data: { title: title },
    });

    res.status(200).json({
      message: "collection updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Image upload
export const Uploadimage = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        message: "No image uploaded",
      });
      return;
    }

    if (!req.user?.id) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const image = await prisma.image.create({
      data: {
        url: req.file.path,
        userId: user.id,
        title: req.body.title,
        location: req.body.location,
      },
    });

    res.status(200).json({
      message: "image uploaded successfully",
      data: image,
    });
    console.log(image);
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Create user collection and add image
export const CreateUserCollection = expressAsyncHandler(async (req, res) => {
  const title = req.body.title;
  const userId = req.body.userId;
  const imageId = req.body.imageId;

  try {
    await prisma.collection.create({
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

    // Manually set the date to the image (mongodb sort the array of images inside the collection auto based on the addedAt field in the Image model)
    const date = new Date();
    await prisma.image.update({
      where: {
        id: imageId,
      },
      data: { addedToCollection: date },
    });

    res.status(200).json({
      message: "Collection Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Add image to an existing user collection
export const AddToCollection = expressAsyncHandler(async (req, res) => {
  const id = req.body.id;
  const imageId = req.body.imageId;

  try {
    const collectionExist = await prisma.collection.findUnique({
      where: {
        id: id,
        images: {
          some: { id: imageId },
        },
      },
    });
    if (collectionExist) {
      await prisma.collection.update({
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

    await prisma.collection.update({
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
    await prisma.image.update({
      where: {
        id: imageId,
      },
      data: { addedToCollection: date },
    });

    res.status(200).json({
      message: "Collection Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
    console.log(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////

// Delete collection
export const DeleteCollection = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.collection.delete({
      where: { id },
    });
    res.status(200).json({
      message: "Collection Deleted",
    });
  } catch (error) {
    console.log(error);
  }
});
