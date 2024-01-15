import {
  generateRecipeIdeaPreamble,
  generateRecipeIngredientsPreamble,
  generateRecipeInstructionsPreamble,
} from "../utils/prompts/preamble";
import { fetchChatResponse } from "../utils/chat";
import { fetchSearchResults } from "../utils/search";
import prisma from "@/lib/prisma";
import { Ingredient } from "@prisma/client";
import { generateImage } from "./image";
import { downloadAndSaveImage } from "./downloadAndSaveImage";

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

// // User chooses
// cuisine: string;

// // first pass
// title: string;
// description: string;
// serves: number;
// prepTime: number;
// cookTime: number;

// ingredients: {
//   priced: {
//     title: string;
//     amount: number;
//     units: string;
//   }[];
//   unpriced: {
//     title: string;
//     amount: number;
//     units: string;
//   }[];
// };

// instructions: string[];

export async function generateRecipe(
  progressCallback: (status: string, progress: number) => void
): Promise<Recipe> {
  let cuisine = undefined;
  progressCallback("Thinking of a Recipe", 0);
  const recipeIdea = await generateRecipeIdea(cuisine);
  console.log("RECIPE IDEA", recipeIdea);
  progressCallback("Choosing Ingredients", 0.1);
  const recipeIngredients = await generateRecipeIngredients(recipeIdea);
  console.log("RECIPE INGREDIENTS", recipeIngredients);
  progressCallback("Writing Instructions", 0.3);
  const recipe = (await generateRecipeInstructions(recipeIngredients)) as Recipe;
  console.log("RECIPE", recipe);
  progressCallback("Making a Shopping List", 0.5);
  const pricedRecipe = await priceIngredients(recipe);
  const recipeWithCosts = calculateCosts(pricedRecipe);
  console.log("RECIPE WITH COSTS", recipeWithCosts);
  progressCallback("Doing a Taste Test", 0.7);
  const finalizedRecipeFields = await finalizeRecipe(recipeWithCosts);
  const finalizedRecipe = { ...recipeWithCosts, ...finalizedRecipeFields };
  console.log("FINALIZED RECIPE", finalizedRecipe);
  progressCallback("Taking a Picture", 0.85);
  const recipeWithImage = await generateImageForRecipe(finalizedRecipe);

  // save recipe to database
  progressCallback("Saving recipe", 0.95);
  console.log("SAVING RECIPE", recipeWithImage);
  await fetch(`/api/saveRecipe?query=${encodeURIComponent(JSON.stringify(recipeWithImage))}`);
  progressCallback("Finished", 1);
  return recipeWithImage;
}

async function generateRecipeIdea(
  cuisine?: string,
  dietaryRestrictions?: string[]
): Promise<{
  title: string;
  protein: string;
  description: string;
  serves: number;
  cuisine: string;
}> {
  const preamble = await generateRecipeIdeaPreamble();
  let chatHistory = [
    {
      role: "user",
      content: preamble,
    },
  ];

  const response = JSON.parse(await fetchChatResponse(chatHistory));
  const recipeIdea = {
    title: response.title,
    protein: response.protein,
    description: response.description,
    serves: response.serves,
    cuisine: cuisine || response.cuisine,
  } as any;
  if (cuisine) {
    recipeIdea.cuisine = cuisine;
  }
  return recipeIdea;
}

async function generateRecipeIngredients(recipeIdea: {
  title: string;
  cuisine: string;
  protein: string;
  description: string;
  serves: number;
}): Promise<any> {
  const preamble = await generateRecipeIngredientsPreamble(recipeIdea);
  let chatHistory = [
    {
      role: "user",
      content: preamble,
    },
  ];

  const response = JSON.parse(await fetchChatResponse(chatHistory));
  return {
    title: recipeIdea.title,
    cuisine: recipeIdea.cuisine,
    protein: recipeIdea.protein,
    description: recipeIdea.description,
    serves: recipeIdea.serves,
    ingredients: response.ingredients,
  };
}

async function generateRecipeInstructions(recipeIdea: {
  title: string;
  cuisine: string;
  protein: string;
  description: string;
  serves: number;
  ingredients: any;
}): Promise<Partial<Recipe>> {
  const preamble = await generateRecipeInstructionsPreamble(recipeIdea);
  let chatHistory = [
    {
      role: "user",
      content: preamble,
    },
  ];

  const response = JSON.parse(await fetchChatResponse(chatHistory));
  return {
    title: recipeIdea.title,
    cuisine: recipeIdea.cuisine,
    description: recipeIdea.description,
    serves: recipeIdea.serves,
    ingredients: recipeIdea.ingredients,
    instructions: response.instructions,
    prepTime: response.prepTime,
    cookTime: response.cookTime,
  };
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
  const openAIImageURL = (
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
  // replace title with a filename safe title
  const blobUrl = await downloadAndSaveImage(
    openAIImageURL,
    `${recipe.title.replace(/\s/g, "_")}.png`
  );
  recipe.image = blobUrl;
  console.log("RECIPE WITH IMAGE: ", recipe);
  return recipe;
}
