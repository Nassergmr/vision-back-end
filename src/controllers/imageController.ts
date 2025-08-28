import expressAsyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

// Get Image
export const GetImage = expressAsyncHandler(async (req, res) => {
  try {
    const image = await prisma.image.findUnique({
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
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Get published images
export const GetPublishedImages = expressAsyncHandler(async (req, res) => {
  try {
    const image = await prisma.image.findMany({
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
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Get popular images
export const GetPopularImages = expressAsyncHandler(async (req, res) => {
  try {
    const image = await prisma.image.findMany({
      where: {
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

//////////////////////////////////////////////////////////////////////////////

// Update image visibility (draft --> published || published --> draft)
export const UpdateImageVisibility = expressAsyncHandler(async (req, res) => {
  const imageId = req.body.id;

  try {
    const isDraft = await prisma.image.findUnique({
      where: {
        id: imageId,
        AND: {
          published: false,
        },
      },
    });

    if (isDraft) {
      await prisma.image.update({
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
    } else {
      await prisma.image.update({
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

// Get image views
export const GetImageViews = expressAsyncHandler(async (req, res) => {
  const imageId = req.params.id;
  try {
    const views = await prisma.image.findUnique({
      where: { id: imageId },
      select: { views: true },
    });

    res.status(200).json({
      views,
    });
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Get image downloads count
export const GetImageDownloadsCount = expressAsyncHandler(async (req, res) => {
  const imageId = req.params.id;
  try {
    const downloadsCount = await prisma.image.findUnique({
      where: { id: imageId },
      select: { downloadsCount: true },
    });

    res.status(200).json({
      downloadsCount,
    });
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Update image likes
export const UpdateImageLikes = expressAsyncHandler(async (req, res) => {
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

      await prisma.image.update({
        where: { id: imageId },
        data: { likesCount: { decrement: 1 } },
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
    await prisma.image.update({
      where: { id: imageId },
      data: { likesCount: { increment: 1 } },
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

//////////////////////////////////////////////////////////////////////////////

// Update image views
export const UpdateImageViews = expressAsyncHandler(async (req, res) => {
  const imageId = req.body.imageId;

  try {
    const image = await prisma.image.update({
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
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////////////////////////////////////////////////

// Update image downloads
export const UpdateImageDownloads = expressAsyncHandler(async (req, res) => {
  const imageId = req.body.imageId;
  const userId = req.body.userId;

  try {
    const image = await prisma.image.update({
      where: { id: imageId },
      data: {
        downloadsCount: { increment: 1 },
      },
    });

    const downloaded = await prisma.download.findUnique({
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

    const downloadedImage = await prisma.download.create({
      data: { imageId: imageId, userId: userId },
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
  } catch (error) {
    console.log(error);
  }
});

// Delete image
export const DeleteImage = expressAsyncHandler(async (req, res) => {
  const id = req.params.id;

  try {
    const image = await prisma.image.update({
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
  } catch (error) {
    console.log(error);
  }
});
