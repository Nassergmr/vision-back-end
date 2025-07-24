import expressAsyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

// Get All Media
export const GetAllMedia = expressAsyncHandler(async (req, res) => {
  try {
    const media = await prisma.image.findMany({
      where: {
        published: true,
      },
      include: {
        imageBy: true,
        likes: true,
      },
    });
    if (!media) {
      res.status(404).json({
        message: "No media found",
      });
      return;
    }
    res.status(200).json({
      message: "Media found",
      media,
    });
  } catch (error) {
    console.log(error);
  }
});

// Update Media
export const UpdateMedia = expressAsyncHandler(async (req, res) => {
  const mediaId = req.body.id;

  try {
    const media = await prisma.image.update({
      where: { id: mediaId },
      data: {
        published: true,
      },
    });
    if (!media) {
      res.status(404).json({
        message: "No media found",
      });
      return;
    }
    res.status(200).json({
      message: "Media Updated",
      media,
    });
  } catch (error) {
    console.log(error);
  }
});
