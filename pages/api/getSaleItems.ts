import { NextApiRequest, NextApiResponse } from "next";
import { Ingredient } from "@prisma/client";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

async function getSaleItems(): Promise<Array<Ingredient & { similarity: number }>> {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });

  // const proteins = [
  //   "Steak",
  //   "Veal",
  //   "Chicken",
  //   "Pork",
  //   "Turkey",
  //   "Lamb",
  //   "Fish",
  //   "Seafood",
  //   "Bacon",
  //   "Sausages",
  //   "Tofu",
  //   "Tempeh",
  //   "Lentils",
  //   "Chickpeas",
  //   "Beans",
  //   "Quinoa",
  //   "Eggs",
  // ];

  // const embeddings = await Promise.all(
  //   proteins.map(async (protein) => {
  //     const repsonse = await openAI.embeddings.create({
  //       model: "text-embedding-ada-002",
  //       input: protein,
  //     });
  //     return response.data.data[0].embedding;
  //   })
  // );

  // const vectorQuery = embeddings.map((embedding) => `ARRAY[${embedding.join(",")}]`).join(",");

  const ingredients: Array<Ingredient & { similarity: number }> = await prisma.$queryRaw`
      SELECT
        "id",
        "title",
        "amount",
        "units",
        "currentPrice",
        "regularPrice",
        "perUnitPrice",
        "discount",
        "onSale"
      FROM ingredients
      WHERE "onSale" = true
      ORDER BY "discount" DESC
      LIMIT 50
  `;

  return ingredients;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const results = await getSaleItems();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
