import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const title = req.query.title as string;
    if (title.toLowerCase() === "all") {
      // delete all recipes
      await prisma.recipeIngredient.deleteMany();
      const recipes = await prisma.recipe.deleteMany();
      res.status(200).json(recipes);
      return;
    }
    // find recipe by name and delete it
    const recipe = await prisma.recipe.findFirst({
      where: {
        title: title,
      },
    });
    await prisma.recipeIngredient.deleteMany({
      where: {
        recipeId: recipe?.id,
      },
    });
    const recipes = await prisma.recipe.deleteMany({
      where: {
        title: title,
      },
    });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
