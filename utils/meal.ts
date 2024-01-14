import { generatePreamble } from "../utils/prompts/preamble";
import { fetchChatResponse } from "../utils/chat";
import { fetchSearchResults } from "../utils/search";
import prisma from "@/lib/prisma";
import { Ingredient } from "@prisma/client";
import { generateImage } from "./image";

export interface Recipe {
  id: string;
  cuisine: string;
  title: string;
  description: string;
  image: string;
  serves: number;
  prepTime: number;
  cookTime: number;
  ingredients: {
    priced: {
      title: string;
      amount: number;
      units: string;
    }[];
    unpriced: {
      title: string;
      amount: number;
      units: string;
    }[];
  };
  shoppingList: {
    title: string;
    quantity: string;
    currentPrice: number;
    regularPrice: number;
    onSale: boolean;
    amountToBuy: number;
  }[];
  instructions: string[];
  totalCost: number;
  regularPrice: number;
}

export async function generateRecipe(
  progressCallback: (status: string, progress: number) => void
): Promise<Recipe> {
  progressCallback("Generating recipe", 0);
  const recipe = await generateInitialRecipe();
  console.log("RECIPE", recipe);
  progressCallback("Finding ingredients", 0.4);
  const pricedRecipe = await priceIngredients(recipe);
  const recipeWithCosts = calculateCosts(pricedRecipe);
  console.log("RECIPE WITH COSTS", recipeWithCosts);
  progressCallback("Finalizing recipe", 0.7);
  const finalizedRecipeFields = await finalizeRecipe(recipeWithCosts);
  const finalizedRecipe = { ...recipeWithCosts, ...finalizedRecipeFields };
  console.log("FINALIZED RECIPE", finalizedRecipe);
  progressCallback("Generating image", 0.85);
  const recipeWithImage = await generateImageForRecipe(finalizedRecipe);

  // save recipe to database
  progressCallback("Saving recipe", 0.95);
  console.log("SAVING RECIPE", recipeWithImage);
  await fetch(`/api/saveRecipe?query=${encodeURIComponent(JSON.stringify(recipeWithImage))}`);
  progressCallback("Finished", 1);
  return recipeWithImage;
}

async function generateInitialRecipe(): Promise<Recipe> {
  const preamble = await generatePreamble();
  let chatHistory = [
    {
      role: "system",
      content: preamble,
    },
  ];

  const recipe = JSON.parse(await fetchChatResponse(chatHistory));
  return recipe;
}

async function generateRecipeName(): Promise<{
  cuisine: string;
  title: string;
  description: string;
  image: string;
  serves: number;
  prepTime: number;
  cookTime: number;
}> {
  const preamble = await generatePreamble();
  let chatHistory = [
    {
      role: "system",
      content: preamble,
    },
  ];

  const recipe = JSON.parse(await fetchChatResponse(chatHistory));
  return recipe;
}

function calculateCosts(pricedRecipe: Recipe) {
  let recipeWithCosts = {
    ...pricedRecipe,
    totalCost: pricedRecipe.shoppingList.reduce((acc, item) => acc + item.currentPrice, 0),
    regularPrice: pricedRecipe.shoppingList.reduce((acc, item) => acc + item.regularPrice, 0),
  };
  return recipeWithCosts;
}

async function priceIngredients(recipe: Recipe) {
  // for each ingredient in the recipe except the protein, do a vector search for the closest ingredient in the store and include it and its details in the recipe
  recipe.shoppingList = [];
  for (let i = 0; i < recipe.ingredients.priced.length; i++) {
    const ingredient = recipe.ingredients.priced[i];
    const results = await fetchSearchResults(ingredient.title, 10, false);
    const chatHistory = [
      {
        role: "system",
        content: `You are a helpful algorithm designed to choose ingredients from the grocery store for a ${recipe.title} recipe. 
        Return responses in valid JSON following this example:
        {
          title: string;
          quantity: string;
          currentPrice: number;
          regularPrice: number;
          onSale: boolean;
          amountToBuy: number;
        }
        `,
      },
      {
        role: "user",
        content: `I am looking for this ingredient or something similar:
        ${ingredient.title}
        Choose the most appropriate ingredient while focusing on cost savings and tell me how many of it I should buy.
        ${JSON.stringify(
          results.map((item: any) => ({
            title: item.title,
            onSale: item.onSale,
            quantity: item.quantity,
          }))
        )}`,
      },
    ];

    const fromChat = JSON.parse(await fetchChatResponse(chatHistory));
    const closestIngredientTitle = fromChat.title;
    const closestIngredient = (await fetchSearchResults(closestIngredientTitle, 1, false))[0];
    recipe.shoppingList[i] = { ...closestIngredient, amountToBuy: fromChat.amountToBuy } as any;
  }
  return recipe;
}

async function finalizeRecipe(
  recipe: Recipe
): Promise<{ title: string; description: string; instructions: string[] }> {
  const chatHistory = [
    {
      role: "system",
      content: `You are a helpful algorithm designed to develop recipes based on grocery store sale data.`,
    },
    {
      role: "user",
      content: `You've generated the following recipe, then from a list of available grocery items, you chose the shopping list for this recipe. It's possible not all items match the original recipe, either in type or quantity.
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
      `,
    },
  ];
  const finalRecipe = JSON.parse(await fetchChatResponse(chatHistory));
  return finalRecipe;
}

async function generateImageForRecipe(recipe: Recipe) {
  const image = (
    await generateImage(`
    A studio quality photo of the following recipe:
      ${JSON.stringify({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.shoppingList.map((item) => item.title),
        instructions: recipe.instructions,
      })}
    `)
  ).url;
  recipe.image = image;
  console.log("RECIPE WITH IMAGE: ", recipe);
  return recipe;
}
