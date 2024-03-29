import { NextApiRequest, NextApiResponse } from "next";
import { Recipe } from "@/utils/generateRecipe";
import prisma from "@/lib/prisma";
import { Ingredient } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;
  const r: Recipe = JSON.parse(query as string);

  try {
    const response = await prisma.recipe.create({
      data: {
        title: r.title,
        image: r.image,
        cuisine: r.cuisine,
        description: r.description,
        serves: r.serves,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        shoppingList: {
          create: [
            ...r.shoppingList
              .filter((item) => item.ingredient.id)
              .map((item: any) => {
                return {
                  amountToBuy: item.amountToBuy,
                  recipeIngredientTitle: item.recipeIngredientTitle,
                  amountLeftover: item.amountLeftover,
                  units: item.units,
                  ingredient: {
                    connect: {
                      id: item.ingredient.id,
                    },
                  },
                };
              }),
          ],
        },
        ingredients: r.ingredients,
        unpricedIngredients: r.unpricedIngredients,
        instructions: r.instructions,
        totalCost: r.totalCost,
        regularPrice: r.regularPrice,
        dietaryRestrictions: r.dietaryRestrictions,
      },
    });

    res.status(200).json(r);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
