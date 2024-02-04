import OpenAI from "openai";
import { Ingredient } from "./ingredientScraper";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

let lastId: number | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // find all ingredients with no embedding
  const ingredients =
    (await prisma.$queryRaw`SELECT id, title, amount, units, "currentPrice", "regularPrice", "perUnitPrice", "discount", "onSale", "dateAdded" FROM "ingredients" WHERE "embedding" IS NULL`) as Ingredient[];

  console.log(`Found ${ingredients.length} ingredients with no embedding`);

  const batchSize = 500;
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
      if (response.data[i].embedding.length > 0) {
        console.log("embedding length", response.data[i].embedding.length);
        await prisma.$executeRaw`
        UPDATE ingredients
        SET embedding = ${response.data[i].embedding}::vector
        WHERE id = ${(batchIngredients[i] as any).id}
      `;
        console.log(
          `Updated ingredient ${start + i + 1} of ${ingredients.length}: ${
            batchIngredients[i].title
          }`
        );
      }
    }
  }

  res.status(200).json({ message: "All ingredients vectorized" });
}

async function vectorizeData(data: Ingredient[]) {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const titles = data.map((ingredient) => ingredient.title);
  const response = await openAI.embeddings.create({
    model: "text-embedding-3-large",
    input: titles,
  });

  console.log(response);

  return response;
}
