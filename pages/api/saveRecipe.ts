import { NextApiRequest, NextApiResponse } from "next";
import { Recipe } from "@/utils/meal";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, limit } = req.query;
  const r: Recipe = JSON.parse(query as string);
  console.log("TRYING TO SAVE THIS RECIPE:", r);

  try {
    const response = await prisma.recipe.create({
      data: {
        title: r.title,
        image: null,
        cuisine: r.cuisine,
        description: r.description,
        serves: r.serves,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        shoppingList: {
          create: [
            ...r.shoppingList.map((item: any) => {
              return {
                amountToBuy: item.amountToBuy,
                ingredient: {
                  connect: {
                    id: item.id,
                  },
                },
              };
            }),
          ],
        },
        ingredients: r.ingredients.priced,
        unpricedIngredients: r.ingredients.unpriced,
        instructions: r.instructions,
        totalCost: r.totalCost,
        regularPrice: r.regularPrice,
      },
    });
    console.log("RESPONSE FROM PRISMA:", response);

    res.status(200).json(r);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
