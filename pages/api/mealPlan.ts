import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mealCount, dietaryRestrictions } = JSON.parse(req.body);
  try {
    const allRecipes = await prisma.recipe.findMany({
      where: {
        dietaryRestrictions: {
          array_contains: dietaryRestrictions,
        },
      },
    });
    const shuffledRecipes = shuffleArray(allRecipes).slice(
      0,
      mealCount ? Number(mealCount) : allRecipes.length
    );

    res.status(200).json(shuffledRecipes);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
