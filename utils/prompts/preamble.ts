// import BeefAndVeal from "../../data/ingredients/Beef_&_Veal.json";
// import Chicken from "../../data/ingredients/Chicken.json";
// import Pork from "../../data/ingredients/Pork.json";
// import Turkey from "../../data/ingredients/Turkey.json";
// import Lamb from "../../data/ingredients/Lamb.json";
// import Fish from "../../data/ingredients/Fish.json";
// import ExoticMeats from "../../data/ingredients/Exotic_Meats.json";
// import FishAndSeafood from "../../data/ingredients/Fish_&_Seafood.json";
// import Bacon from "../../data/ingredients/Bacon.json";
// import HotDogsAndSausages from "../../data/ingredients/Hot_Dogs_&_Sausages.json";

import { Ingredient } from "@prisma/client";
import { fetchSearchResults } from "../search";
import { DietaryRestrictions, Recipe } from "../meal";

export const generateRecipeIdeaPreamble = async (
  proteinsOnSale: Ingredient[],
  cuisine?: string,
  dietaryRestrictions?: string[],
  ingredients?: Ingredient[]
) => `You are a helpful algorithm designed to take in grocery store sale data and output a delicioius recipe.
  Recipes should be healthy, balanced meals.
  Your recipes are delicious, diverse, healthy, and draw from multiple cultures and cuisines.
  Your recipes should be diverse and come from all over the world.
  ${
    !!dietaryRestrictions && dietaryRestrictions.length > 0
      ? `Your recipe must be ${dietaryRestrictions.join(", ")}.`
      : ""
  }

  Return one recipe in JSON following this example:
  {
    protein: "Chicken Leg Quarters Value Size 3-5 Pieces",
    ${cuisine ? "" : `cuisine: "Mexican",`}
    title: "Sweet Potato and Chicken Hash",
    description: "A cozy, hearty meal to warm you on those cold winter nights. lots of protein and veggies to keep you full and healthy."
    serves: 4,
  }

  proteins on sale: ${proteinsOnSale.map((protein) => protein.title).join(", ")}
`;

export const generateRecipeIngredientsPreamble = async (
  recipeIdea: Partial<Recipe>
) => `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
given the following recipe idea, choose the ingredients and return them following this example JSON:
{
  ingredients: {
    priced: [
      {title: "sweet potatoes", amount: 0.2, units: "kg"},
      {"title": "chicken breasts", "amount": 4, "units": "items"},
      {"title": "red onion", "amount": 1, "units": "item"},
      {"title": "zucchini", "amount": 1, "units": "item"},
      {"title": "head of broccoli", "amount": 1, "units": "item"},
      {"title": "cooked brown rice", "amount": 0.5, "units": "cup"},
    ],
    unpriced: [
      {title: "olive oil", amount: 1, units: "tablespoon"},
      {title: "salt", amount: 1, units: "teaspoon"},
      {title: "black pepper", amount: 1, units: "teaspoon"}
    ]
  },
}

  Unpriced ingredients should be common pantry items like cooking oils, vinegars, sauces like Soy sauce, Worcestershire sauce, Hot sauce, condiments like  Mustard, Ketchup, Mayonnaise, spices and dried herbs like cinnamon, cumin, dried rosemary, etc.
  Unpriced ingredients should not include things like fresh herbs, like fresh basil, fresh rosemary, fresh thyme, etc.
  Keep the ingredients as generic as possible except in cases where it's an important destinction. For exmaple, use "bread crumbs" instead of "whole grain bread crumbs", but use "fresh basil" or "dry basil" instead of "basil".

  Recipe:
  ${recipeIdea.title}
  ${recipeIdea.description}
  Serves: ${recipeIdea.serves}
`;

export const generateRecipeInstructionsPreamble = async (
  recipeIdea: Partial<Recipe>
) => `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
given the following recipe, come up with the instructions and return them following this example JSON:
{
  instructions: [
    "Preheat oven to 425°F.",
    "Chop all vegetables.",
    "In a large bowl, toss sweet potatoes, zucchini, onion, and broccoli with olive oil, salt, and pepper.",
    "Spread the vegetables on a baking sheet and roast in the oven for 25 minutes.",
    "Cook the brown rice as per the instructions on the package.",
    "Meanwhile, heat a large non-stick skillet over medium-high heat and cook the chicken breasts for 6-8 minutes on each side or until cooked through.",
    "Once the vegetables are roasted, add the rice and chicken to the bowl and toss to combine.",
    "Serve immediately and enjoy!"
  ],
  prepTime: 15,
  cookTime: 30,
}

  Recipe:
  ${recipeIdea.title}
  ${recipeIdea.description}
  Serves: ${recipeIdea.serves}
  Ingredients: ${recipeIdea.ingredients?.priced
    .map((item: any) => item.title)
    .join(", ")}, ${recipeIdea.ingredients?.unpriced.map((item: any) => item.title).join(", ")}
`;

export const generatePricingIngredientsPreamble = async (
  recipeIngredient: { amount: number; units: string; title: string },
  storeItems: Ingredient[],
  recipe: Partial<Recipe>,
  tryAgain = false
) => `You are a helpful algorithm designed to choose ingredients from the grocery store for a ${
  recipe.title
} recipe. 
Return responses in valid JSON following this example:
{
  title: string;
  quantity: string;
  currentPrice: number;
  regularPrice: number;
  onSale: boolean;
  amountToBuy: number;
}

I am looking for ${recipeIngredient.amount}${recipeIngredient.units} of ${
  recipeIngredient.title
} for this recipe: ${recipe.title}. Ingredients must be ${recipe.dietaryRestrictions?.join(", ")}.
While focusing on cost savings, tell me which of the following grocery items I should buy and how many of it I should buy.
Amounts don't need to be exact, but should be close. If the recipe calls for 500g of chicken, 400g is fine. Don't buy two of the chicken in this case.
But if the recipe calls for 500g of chicken, 250g is not enough. Buy more than one of the chicken in this case.
${JSON.stringify(
  storeItems.map((item: any) => ({
    title: item.title,
    price: item.currentPrice,
    quantity: item.quantity,
  }))
)}

${
  tryAgain
    ? `If the item I'm looking for is not in the list, tell me a substitute I should look for instead. Return it in the following format:
{
newTitle: string; 
newQuantity: string;
}`
    : ``
}
`;

export const generateFinalizeRecipePreamble1 = async (
  recipe: Recipe
) => `You are a helpful algorithm designed to develop recipes based on grocery store sale data.
You've generated the following recipe, then from a list of available grocery items, you chose the shopping list for this recipe. It's possible not all items match the original recipe, either in type or quantity.
  It's also possible that the dietary restrictions labels missing or incorrect.
  Adjust the title, description, and instructions to match the shopping list. Do not include brand names anywhere.
  The title should be short and avoid using brand names or too many adjectives to describe things the dish.
  The title should make the dish sound appetizing and unique.
  present it in the following JSON format:
  
  {
    title: string;
    description: string;
    instructions: string[];
  }

  The Recipe:
  ${JSON.stringify(recipe)}
  `;

export const generateFinalizeRecipePreamble2 =
  async () => `Now also adjust the dietary restrictions and cuisine based on the full recipe.
  return the adjusted fields along with the previous JSON like so:
  {
    title: string;
    description: string;
    instructions: string[];
    cuisine: string;
    dietaryRestrictions: string[];
  }
  
  Choose all dietary restrictions from the following list that apply to the recipe.

  Possible dietary restrictions:
  ${Object.values(DietaryRestrictions).join(", ")}
  `;

export const generateImagePreamble = async (recipe: Recipe) => `
  A studio quality photo of the following recipe plated and ready to serve in a nice, cosy setting:
    ${JSON.stringify({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.shoppingList.map((item) => item.title),
      instructions: recipe.instructions,
    })}
  `;
