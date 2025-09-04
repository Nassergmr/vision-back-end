import expressAsyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

export const GetSearchImages = expressAsyncHandler(async (req, res) => {
  const query = req.params.query;
  try {
    // const results = await prisma.image.findMany({
    //   where: {
    //     title: { contains: query, mode: "insensitive" },
    //     published: true,
    //     isVisible: true,
    //   },
    //   include: { user: true, likes: true, downloads: true },
    // });

    const results = await prisma.$runCommandRaw({
      aggregate: "images",
      pipeline: [
        {
          $search: {
            index: "default", // your Atlas Search index name
            text: {
              query: query,
              path: ["title", "location", "tags"], // removed trailing space
            },
          },
        },
        { $limit: 10 },
        {
          $project: {
            title: 1,
            location: 1,
            tags: 1,
            published: 1,
            isVisible: 1,
          },
        },
      ],
      cursor: {}, // required for $runCommandRaw
    });

    res.status(200).json(results);
  } catch (error) {
    console.log(error);
  }
});
