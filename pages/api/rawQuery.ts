import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.body;
  try {
    const result = executeRawSQLQuery(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error executing raw SQL query:", error);
    res.status(500).json({ error: "Error executing raw SQL query" });
  }
}

export async function executeRawSQLQuery(query: string): Promise<any> {
  try {
    const result = await prisma.$queryRawUnsafe(`SELECT * FROM recipes`);
    return result;
  } catch (error) {
    console.error("Error executing raw SQL query:", error);
    throw error;
  }
}
