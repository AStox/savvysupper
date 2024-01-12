import { generatePreamble } from "../utils/prompts/preamble";
import { fetchChatResponse } from "../utils/chat";
import { fetchSearchResults } from "../utils/search";
import prisma from "@/lib/prisma";
import { Ingredient } from "@prisma/client";
import { generateImage } from "./image";

export interface Recipe {
  cuisine: string;
  title: string;
  description: string;
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

export async function generateRecipe() {
  const recipe = await generateInitialRecipe();
  const pricedRecipe = await priceIngredients(recipe);
  const recipeWithCosts = calculateCosts(pricedRecipe);
  const finalizedRecipe = await finalizeRecipe(recipeWithCosts);
  const recipeWithImage = await generateImageForRecipe(finalizedRecipe);

  // save recipe to database
  await fetch(`/api/saveRecipe?query=${encodeURIComponent(JSON.stringify(recipeWithImage))}`);
  return recipeWithImage;
}

async function generateInitialRecipe(): Promise<Recipe> {
  const preamble = await generatePreamble();
  console.log("PREAMBLE", preamble);
  let chatHistory = [
    {
      role: "system",
      content: preamble,
    },
  ];

  const recipe = JSON.parse(await fetchChatResponse(chatHistory));
  console.log("RECIPE FROM API:", recipe);
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
    console.log(ingredient);
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
    console.log("closestIngredient", closestIngredient);
    recipe.shoppingList[i] = { ...closestIngredient, amountToBuy: fromChat.amountToBuy } as any;
  }
  return recipe;
}

async function finalizeRecipe(recipe: Recipe) {
  const chatHistory = [
    {
      role: "system",
      content: `You are a helpful algorithm designed to develop recipes based on grocery store sale data.`,
    },
    {
      role: "user",
      content: `You've generated the following recipe, then from a list of available grocery items, you chose the shopping list for this recipe. It's possible not all items match the original recipe, either in type or quantity.
      Take a look at the shopping list and adjust the title, description, and instructions to match the shopping list.
      present it in the same JSON format.

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
    A high quality photo of the following recipe, on a blue grey concrete table, in a minimalist style.
      ${JSON.stringify({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients.priced.map((item) => item.title),
        instructions: recipe.instructions,
      })}
    `)
  ).url;
  const recipeWithImage = { ...recipe, image };
  return recipeWithImage;
}
