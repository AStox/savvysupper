import OpenAI from "openai";
import { Ingredient } from "./ingredientScraper";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

let lastId: number | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // find all ingredients with no embedding
  const ingredients =
    (await prisma.$queryRaw`SELECT * FROM "ingredients" WHERE "embedding" IS NULL`) as Ingredient[];

  const batchSize = 1000;
  const totalBatches = Math.ceil(ingredients.length / batchSize);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, ingredients.length);
    const batchIngredients = ingredients.slice(start, end);

    const response = await vectorizeData(batchIngredients);

    if (response.data.length !== batchIngredients.length) {
      res.status(500).json(response);
      return;
    }

    for (let i = 0; i < batchIngredients.length; i++) {
      await prisma.$executeRaw`
        UPDATE ingredients
        SET embedding = ${response.data[i].embedding}::vector
        WHERE id = ${batchIngredients[i].id}
      `;
      console.log(
        `Updated ingredient ${start + i + 1} of ${ingredients.length}: ${batchIngredients[i].title}`
      );
    }
  }

  res.status(200).json({ message: "All ingredients vectorized" });
}

async function vectorizeData(data: Ingredient[]) {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const titles = data.map((ingredient) => ingredient.title);
  const response = await openAI.embeddings.create({
    model: "text-embedding-ada-002",
    input: titles,
  });

  console.log(response);

  return response;
}
