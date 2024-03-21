import { NextApiRequest, NextApiResponse } from "next";
import { Ingredient } from "@prisma/client";
import prisma from "@/lib/prisma";

async function searchByTitle(query: string): Promise<Ingredient[]> {
  const results = await prisma.ingredient.findMany({
    where: {
      title: {
        contains: query,
      },
    },
  });
  return results;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query as { query: string };

  try {
    const results = await searchByTitle(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
