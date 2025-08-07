import expressAsyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

// Get published images
export const GetPublishedimages = expressAsyncHandler(async (req, res) => {
  try {
    const image = await prisma.image.findMany({
      where: {
        published: true,
      },
      include: {
        user: true,
        // likes: true,
        // comments: true,
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

//////////////////////////////////////////////////////////////////////////////

// Update image (draft --> published)
export const Updateimage = expressAsyncHandler(async (req, res) => {
  const imageId = req.body.id;

  try {
    const isPublished = await prisma.image.findUnique({
      where: {
        id: imageId,
        AND: {
          published: true,
        },
      },
    });

    if (isPublished) {
      await prisma.image.update({
        where: {
          id: imageId,
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

    const image = await prisma.image.update({
      where: { id: imageId },
      data: {
        published: true,
      },
    });
    if (!image) {
      res.status(404).json({
        message: "No image found",
      });
      return;
    }
    res.status(200).json({
      message: "Published Successfully",
      image,
    });
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Get image likes
export const GetImageLikes = expressAsyncHandler(async (req, res) => {
  const imageId = req.params.id;
  try {
    const image = await prisma.image.findUnique({
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
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Get image comments
export const GetImageComments = expressAsyncHandler(async (req, res) => {
  const imageId = req.params.id;
  try {
    // const image = await prisma.image.findUnique({
    //   where: { id: imageId },
    //   select: {
    //     comments: true,

    //     // user: { select: { avatar: true, firstName: true, lastName: true } },
    //   },
    // });
    const comments = await prisma.comment.findMany({
      where: { imageId: imageId },
      include: { user: true },
    });

    res.status(200).json({
      comments,
    });
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Update image likes
export const UpdateimageLikes = expressAsyncHandler(async (req, res) => {
  const imageId = req.body.imageId;
  const imageUrl = req.body.imageUrl;
  const userId = req.body.userId;

  const liked = await prisma.like.findUnique({
    where: {
      userId_imageId: {
        imageId: imageId,
        userId: userId,
      },
    },
  });

  try {
    if (liked) {
      await prisma.like.delete({
        where: {
          userId_imageId: {
            imageId: imageId,
            userId: userId,
          },
        },
      });
      res.status(200).json({
        message: "Image Unliked Successfully",
      });
      return;
    }
    const likes = await prisma.like.create({
      data: {
        imageId: imageId,
        imageUrl: imageUrl,
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
      message: "Image Updated Successfully",
      likes,
    });
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Update image comments
export const UpdateimageComments = expressAsyncHandler(async (req, res) => {
  const content = req.body.content;
  const imageId = req.body.imageId;
  const imageUrl = req.body.imageUrl;
  const userId = req.body.userId;

  try {
    const comment = await prisma.comment.create({
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
  } catch (error) {
    console.log(error);
  }
});
