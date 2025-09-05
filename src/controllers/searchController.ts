import expressAsyncHandler from "express-async-handler";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

type MongoSearchResult = {
  cursor: {
    firstBatch: { _id: string }[];
  };
};

export const GetSearchImages = expressAsyncHandler(async (req, res) => {
  const query = req.params.query;

  try {
    const response = (await prisma.$runCommandRaw({
      aggregate: "Image",
      pipeline: [
        {
          $search: {
            index: "default",
            text: {
              query: String(query),
              path: ["title", "location", "tags"],
              fuzzy: {
                maxEdits: 2,
                prefixLength: 1,
              },
            },
          },
        },
        { $limit: 20 },
        { $project: { _id: 1 } },
      ],
      cursor: {},
    })) as unknown as MongoSearchResult;

    const ids = response.cursor?.firstBatch.map((doc: any) => doc._id.$oid);

    if (!ids || ids.length === 0) {
      res.status(200).json({ results: [] });
      return;
    }

    const results = await prisma.image.findMany({
      where: { id: { in: ids }, published: true, isVisible: true },
      include: {
        user: true,
        likes: true,
        downloads: true,
      },
    });

    res.status(200).json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
});
