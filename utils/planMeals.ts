import { DietaryRestrictions, Recipe } from "./generateRecipe";
import { fetchChatResponse } from "./chat";
import { generateLeftoversPreamble, generateNextRecipePreamble } from "./prompts/preamble";

export const fetchMeals = async (mealCount: number, dietaryRestrictions: DietaryRestrictions[]) => {
  const recipes = await fetch("/api/mealPlan", {
    method: "POST",
    body: JSON.stringify({ dietaryRestrictions }),
  }).then((res) => res.json());
  for (let i = 0; i < recipes.length; i++) {
    const newShoppingList = [];
    const recipe = recipes[i];
    for (let j = 0; j < recipe.ingredients.length; j++) {
      const ingredient = recipe.ingredients[j];
      console.log("INGREDIENT", ingredient.title);

      const shoppedItem = recipe.shoppingList.find(
        (item: any) => item.recipeIngredientTitle === ingredient.title
      );
      if (!shoppedItem) {
        throw new Error(`Could not find ingredient ${ingredient.title} in shopping list`);
      }
      newShoppingList.push(shoppedItem);
    }
    recipes[i].shoppingList = newShoppingList;
  }

  return recipes;
};

export const PlanMeals = async (mealCount: number, dietaryRestrictions: DietaryRestrictions[]) => {
  let meals = [];
  const allMeals = await fetchMeals(mealCount, dietaryRestrictions);
  console.log("ALL MEALS", allMeals);
  // if (allMeals.length < mealCount) {
  //   throw new Error("Not enough recipes to plan meals");
  // }
  // const first = allMeals[Math.floor(Math.random() * allMeals.length)];
  // // console.log("FIRST RECIPE", first);
  // // if (first) {
  // //   meals.push(first);
  // // }
  // const leftovers = JSON.parse(await getLeftovers(first)).leftovers;
  // console.log("FIRST RECIPE LEFTOVERS", leftovers);
  // const next = await getNextRecipe(
  //   leftovers,
  //   allMeals.filter((meal: Recipe) => meal.id !== first.id)
  // );
  // meals.push(next);
  return allMeals;
};

// const getNextRecipe = async (
//   leftovers: { title: string; units: string; amountLeftOver: number }[],
//   recipes: Recipe[]
// ) => {
//   const preamble = generateNextRecipePreamble(
//     leftovers.map((item) => ({
//       title: item.title,
//       amountLeftOver: item.amountLeftOver,
//       units: item.units,
//     })),
//     recipes.map((recipe) =>
//       recipe.shoppingList.map((item) => ({
//         title: item.ingredient.title,
//         amount: item.ingredient.amount,
//         units: item.ingredient.units,
//         amountToBuy: item.amountToBuy,
//       }))
//     )
//   );
//   console.log("Get next recipe PREAMBLE", preamble);
//   const { index } = JSON.parse(
//     await fetchChatResponse([
//       {
//         role: "user",
//         content: preamble,
//       },
//     ])
//   );
//   return recipes[index];
// };
