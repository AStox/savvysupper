import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mealCount, dietaryRestrictions } = JSON.parse(req.body);
  console.log(req.body);
  console.log("MEAL COUNT", mealCount);
  console.log("DIETARY RESTRICTIONS", dietaryRestrictions);
  try {
    const recipes = await prisma.recipe.findMany({
      take: Number(mealCount),
      where: {
        dietaryRestrictions: {
          array_contains: dietaryRestrictions,
        },
      },
    });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
