import expressAsyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

// Get All Published Media
export const GetAllPublishedMedia = expressAsyncHandler(async (req, res) => {
  try {
    const media = await prisma.image.findMany({
      where: {
        published: true,
      },
      include: {
        user: true,
        likes: true,
        comments: true,
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

//////////////////////////////////////////////////////////////////////////////

// Update Media (draft --> published)
export const UpdateMedia = expressAsyncHandler(async (req, res) => {
  const mediaId = req.body.id;

  try {
    const isPublished = await prisma.image.findUnique({
      where: {
        id: mediaId,
        AND: {
          published: true,
        },
      },
    });

    if (isPublished) {
      await prisma.image.update({
        where: {
          id: mediaId,
        },
        data: {
          published: false,
        },
      });
      res.status(200).json({
        message: "Unpublished Successfully",
      });
      return;
    }

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
      message: "Published Successfully",
      media,
    });
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Update media likes
export const UpdateMediaLikes = expressAsyncHandler(async (req, res) => {
  const mediaId = req.body.mediaId;
  const mediaUrl = req.body.mediaUrl;
  const userId = req.body.userId;

  const liked = await prisma.like.findUnique({
    where: {
      userId_imageId: {
        imageId: mediaId,
        userId: userId,
      },
    },
  });

  try {
    if (liked) {
      res.status(400).json({
        message: "Image already liked!",
      });
      return;
    }
    const likes = await prisma.like.create({
      data: {
        imageId: mediaId,
        imageUrl: mediaUrl,
        userId: userId,
      },
    });
    if (!likes) {
      res.status(404).json({
        message: "No likes found",
      });
      return;
    }
    res.status(200).json({
      message: "Likes Updated",
      likes,
    });
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Update media comments
export const UpdateMediaComments = expressAsyncHandler(async (req, res) => {
  const content = req.body.content;
  const mediaId = req.body.mediaId;
  const mediaUrl = req.body.mediaUrl;
  const userId = req.body.userId;

  try {
    const comment = await prisma.comment.create({
      data: {
        content: content,
        imageId: mediaId,
        imageUrl: mediaUrl,
        userId: userId,
      },
      // include: {
      //   user: true
      // }
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
  } catch (error) {
    console.log(error);
  }
});
