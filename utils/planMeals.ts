import { Ingredient } from "@/pages/api/ingredientScraper";
import { DietaryRestrictions, Recipe } from "./meal";
import { fetchChatResponse } from "./chat";
import { generateLeftoversPreamble, generateNextRecipePreamble } from "./prompts/preamble";
import { get } from "http";

export const fetchMeals = async (mealCount: number, dietaryRestrictions: DietaryRestrictions[]) => {
  const recipes = await fetch("/api/mealPlan", {
    method: "POST",
    body: JSON.stringify({ dietaryRestrictions }),
  }).then((res) => res.json());
  return recipes;
};

export const PlanMeals = async (mealCount: number, dietaryRestrictions: DietaryRestrictions[]) => {
  let meals = [];
  const allMeals = await fetchMeals(mealCount, dietaryRestrictions);
  if (allMeals.length < mealCount) {
    throw new Error("Not enough recipes to plan meals");
  }
  const first = allMeals[Math.floor(Math.random() * allMeals.length)];
  console.log("FIRST RECIPE", first);
  meals.push(first);
  const leftovers = JSON.parse(await getLeftovers(first)).leftovers;
  console.log("FIRST RECIPE LEFTOVERS", leftovers);
  const next = await getNextRecipe(leftovers, allMeals);
  meals.push(next);
  return meals;
};

const getNextRecipe = async (leftovers: Ingredient[], recipes: Recipe[]) => {
  console.log(
    "Get next recipe PREAMBLE",
    generateNextRecipePreamble(
      leftovers.map((item) => ({ title: item.title, quantity: item.quantity })),
      recipes.map((recipe) =>
        recipe.shoppingList.map((item) => ({
          title: item.ingredient.title,
          quantity: item.ingredient.quantity,
          amountToBuy: item.amountToBuy,
        }))
      )
    )
  );
  const { index } = await fetchChatResponse([
    {
      role: "user",
      content: generateNextRecipePreamble(
        leftovers.map((item) => ({ title: item.title, quantity: item.quantity })),
        recipes.map((recipe) =>
          recipe.shoppingList.map((item) => ({
            title: item.ingredient.title,
            quantity: item.ingredient.quantity,
            amountToBuy: item.amountToBuy,
          }))
        )
      ),
    },
  ]);
  return recipes[index];
};

const getLeftovers = async (recipe: Recipe) => {
  console.log("Get lefovers PREAMBLE", generateLeftoversPreamble(recipe));
  const leftovers = await fetchChatResponse([
    {
      role: "user",
      content: generateLeftoversPreamble(recipe),
    },
  ]);
  return leftovers;
};

function parseQuantity(quantity: string): {
  amount: number;
  unit: string;
} {
  const match = quantity.match(/^(\d+(?:\.\d+)?)([a-zA-Z ]+)$/);
  if (match) {
    let amount = parseFloat(match[1]);
    let unit = match[2].trim().toLowerCase();

    // Convert kg to g
    if (unit === "kg") {
      amount *= 1000;
      unit = "g";
    }
    // Default unit to 'count' for non-standard units
    else if (!["g", "l", "ml", "oz", "lb"].includes(unit)) {
      unit = "count";
    }

    return { amount, unit };
  } else {
    return { amount: 0, unit: "unknown" };
  }
}
