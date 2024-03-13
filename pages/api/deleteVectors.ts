import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    clearEmbeddingColumns();
    res.status(200).json({ message: "Embedding columns cleared." });
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}

async function clearEmbeddingColumns() {
  const clearQuery = `UPDATE "ingredients" SET "embedding" = NULL;`;
  await prisma.$executeRawUnsafe(clearQuery);
}
