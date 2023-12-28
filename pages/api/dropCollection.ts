import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const address = process.env.MILVUS_ENDPOINT as string;
  const token = process.env.MILVUS_TOKEN as string;
  const milvusClient = new MilvusClient({ address, token });
  const response = await milvusClient.dropCollection({
    collection_name: "Ingredients",
  });
  if (response.code !== 0) {
    res.status(500).json(response);
    return;
  }
  res.status(200).json(response);
  return;
}
