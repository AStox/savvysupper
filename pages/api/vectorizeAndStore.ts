import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import OpenAI from "openai";
import fs from "fs";
import { Ingredient } from "./ingredientScraper";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const MILVUS_HOST = "https://in03-9479dd5ae4f429f.api.gcp-us-west1.zillizcloud.com";
  const MILVUS_PORT = "19530";

  const milvusClient = new MilvusClient(`${MILVUS_HOST}:${MILVUS_PORT}`);

  const data = JSON.parse(fs.readFileSync("Fresh_Fruits_&_Vegetables_ingredients.json", "utf8"));
  const vectors = await vectorizeData(data);

  // store in milvus
}

async function vectorizeData(data: any) {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const response = await openAI.embeddings.create({
    model: "text-embedding-ada-002",
    input: data.map(ingredientToPlaneText),
  });
  console.log(response);
  return data.map((ingredient: Ingredient, index: number) => {
    return {
      ...ingredient,
      vector: response.data[index].embedding,
    };
  });
}

function ingredientToPlaneText(ingredient: Ingredient) {
  return `${ingredient.quantity} of ${ingredient.title} for ${ingredient.currentPrice}${
    ingredient.onSale ? " on sale. Regularly " + ingredient.regularPrice : ""
  }`;
}
