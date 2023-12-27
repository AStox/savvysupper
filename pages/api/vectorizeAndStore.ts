import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import OpenAI from "openai";
import fs from "fs";
import { Ingredient } from "./ingredientScraper";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const data = JSON.parse(fs.readFileSync("Fresh_Fruits_&_Vegetables_ingredients.json", "utf8"));
  // const address = process.env.MILVUS_ENDPOINT as string;
  // const token = process.env.MILVUS_TOKEN as string;
  // const milvusClient = new MilvusClient({ address, token });
  // const response = await milvusClient.describeCollection({
  //   collection_name: "Ingredients",
  // });
  // console.log(response);
  const vectors = await vectorizeData(data);

  await storeVectorsInMilvus(vectors);
  res.status(200).json({ message: "Vectorization and storage completed" });
}

async function vectorizeData(data: any) {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const response = await openAI.embeddings.create({
    model: "text-embedding-ada-002",
    input: data.map(ingredientToPlaneText),
  });
  return data.map((ingredient: Ingredient, index: number) => {
    return {
      ...ingredient,
      vector: response.data[index].embedding,
    };
  });
}

interface VectorizedIngredient extends Ingredient {
  vector: number[];
}

async function storeVectorsInMilvus(vectorizedData: VectorizedIngredient[]) {
  const address = process.env.MILVUS_ENDPOINT as string;
  const token = process.env.MILVUS_TOKEN as string;
  const milvusClient = new MilvusClient({ address, token });

  const data = { ...vectorizedData[0] };

  const res = await milvusClient.insert({
    collection_name: "Ingredients",
    data: [data],
  });

  console.log("RESPONSE:", res);
}

function ingredientToPlaneText(ingredient: Ingredient) {
  return `${ingredient.quantity} of ${ingredient.title} for ${ingredient.currentPrice}${
    ingredient.onSale ? " on sale. Regularly " + ingredient.regularPrice : ""
  }`;
}

function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const uniqueId = BigInt(timestamp) * BigInt(1000000) + BigInt(random);
  return uniqueId.toString();
}
