import { MilvusClient, RowData } from "@zilliz/milvus2-sdk-node";
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
  // check that each vector is 1536 dimensions
  for (const vector of vectors) {
    if (vector.vector.length !== 1536) {
      res.status(500).json({ error: "Vector is not 1536 dimensions" });
      return;
    }
  }
  console.log(`all ${vectors.length} vectors are 1536 dimensions`);

  const vectorChunks = chunkArray(vectors, 300) as RowData[][];

  console.log(`Inserting ${vectorChunks.length} chunks of vectors into Milvus`);

  for (const chunk of vectorChunks) {
    console.log("Inserting chunk of vectors into Milvus");
    const response = await storeVectorsInMilvus(chunk);
    if (response.status.error_code !== 0) {
      res.status(500).json(response);
      return;
    }
    console.log("Inserted chunk of vectors into Milvus");
  }
  res.status(200).json({ message: "All vectors stored in Milvus" });
  return;

  const response = await storeVectorsInMilvus(vectorChunks[0]);
  console.log("!!!!!!!!!!! response:", response);
  res.status(200).json({ message: "All vectors stored in Milvus" });
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
      id: generateUniqueId(),
    };
  });
}

interface VectorizedIngredient extends Ingredient {
  vector: number[];
  id: string;
}

async function storeVectorsInMilvus(vectorizedData: RowData[]) {
  const address = process.env.MILVUS_ENDPOINT as string;
  const token = process.env.MILVUS_TOKEN as string;
  const milvusClient = new MilvusClient({ address, token });

  const response = await milvusClient.insert({
    collection_name: "Ingredients",
    data: vectorizedData,
  });

  return response;
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

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }
  return results;
}
