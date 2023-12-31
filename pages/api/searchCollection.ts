import { NextApiRequest, NextApiResponse } from "next";
import search from "./_searchCollection";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const results = await search("bean sprouts", 5);
  res.status(200).json(results);
}
