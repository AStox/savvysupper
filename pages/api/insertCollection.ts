import { MilvusClient, RowData } from "@zilliz/milvus2-sdk-node";
import fs from "fs";
import path from "path";
import { Ingredient } from "./ingredientScraper";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // const CHUNK_SIZE = 100;
  // const WAIT_TIME = 1000;
  // const address = process.env.MILVUS_ENDPOINT as string;
  // const token = process.env.MILVUS_TOKEN as string;
  // const milvusClient = new MilvusClient({ address, token });
  // const files = fs.readdirSync("data/vectors/");
  // for (const file of files) {
  //   const filePath = path.join("data/vectors/", file);
  //   const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  //   // check that each vector is 1536 dimensions
  //   for (const vector of data) {
  //     if (vector.vector.length !== 1536) {
  //       res.status(500).json({ error: "Vector is not 1536 dimensions" });
  //       return;
  //     }
  //   }
  //   console.log(`all ${data.length} vectors are 1536 dimensions`);
  //   // check that all ids are present and unique
  //   const ids = new Set<string>();
  //   for (const vector of data) {
  //     if (ids.has(vector.id)) {
  //       res.status(500).json({ error: "Duplicate id" });
  //       return;
  //     }
  //     ids.add(vector.id);
  //   }
  //   console.log(`all ${data.length} ids are unique`);
  //   const vectorChunks = chunkArray(data, CHUNK_SIZE) as RowData[][];
  //   console.log(`Inserting ${vectorChunks.length} chunks of vectors into Milvus`);
  //   for (const chunk of vectorChunks) {
  //     console.log("Inserting vector into Milvus");
  //     const response = await storeVectorsInMilvus(milvusClient, chunk);
  //     console.log("Inserted chunk of vectors into Milvus");
  //     await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
  //   }
  // }
  // res.status(200).json({ message: "All vectors stored in Milvus" });
  // return;
  // await prisma?.ingredient.createMany({
  //   data: [
  //   ]
}

// async function storeVectorsInMilvus(milvusClient: MilvusClient, vectorizedData: RowData[]) {
//   const response = await milvusClient.insert({
//     collection_name: "Ingredients",
//     data: vectorizedData,
//   });

//   return response;
// }

// function chunkArray<T>(array: T[], chunkSize: number): T[][] {
//   const results = [];
//   while (array.length) {
//     results.push(array.splice(0, chunkSize));
//   }
//   return results;
// }
