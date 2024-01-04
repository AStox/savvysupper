import { preamble } from "../utils/prompts/preamble";
import { fetchChatResponse } from "../utils/chat";
import { fetchSearchResults } from "../utils/search";

export interface Recipe {
  cuisine: string;
  title: string;
  description: string;
  serves: number;
  prepTime: number;
  cookTime: number;
  ingredients: {
    priced: {
      fromRecipe: {
        title: string;
        amount: number;
        units: string;
      };
      fromStore: {
        title: string;
        quantity: string;
        currentPrice: number;
        regularPrice: number;
        onSale: boolean;
        amountToBuy: number;
      };
    }[];
    unpriced: {
      title: string;
      amount: number;
      units: string;
    }[];
  };
  instructions: string;
  costPerServing: number;
  regularPriceCostPerServing: number;
  totalCost: number;
  regularPriceTotalCost: number;
  discount: number;
}

export async function generateRecipe(): Promise<Recipe> {
  const recipe = await generateInitialRecipe();
  const pricedRecipe = await priceIngredients(recipe);
  const recipeWithCosts = calculateCosts(pricedRecipe);
  // const finalizedRecipe = await finalizeRecipe(pricedRecipe);
  return recipeWithCosts;
}

async function generateInitialRecipe(): Promise<Recipe> {
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
    costPerServing:
      pricedRecipe.ingredients.priced.reduce((acc, item) => acc + item.fromStore.currentPrice, 0) /
      pricedRecipe.serves,
    regularPriceCostPerServing:
      pricedRecipe.ingredients.priced.reduce((acc, item) => acc + item.fromStore.regularPrice, 0) /
      pricedRecipe.serves,
    totalCost: pricedRecipe.ingredients.priced.reduce(
      (acc, item) => acc + item.fromStore.currentPrice,
      0
    ),
    regularPriceTotalCost: pricedRecipe.ingredients.priced.reduce(
      (acc, item) => acc + item.fromStore.regularPrice,
      0
    ),
    discount: pricedRecipe.ingredients.priced.reduce(
      (acc, item) => acc + item.fromStore.regularPrice - item.fromStore.currentPrice,
      0
    ),
  };

  console.log("RECIPE WITH COSTS:", recipeWithCosts);
  return recipeWithCosts;
}

async function priceIngredients(recipe: Recipe) {
  // for each ingredient in the recipe except the protein, do a vector search for the closest ingredient in the store and include it and its details in the recipe
  for (let i = 0; i < recipe.ingredients.priced.length; i++) {
    const ingredient = recipe.ingredients.priced[i];
    console.log(ingredient);
    const results = await fetchSearchResults(ingredient.fromRecipe.title, 5);
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
        ${ingredient.fromRecipe.title}
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

    const closestIngredientTitle = JSON.parse(await fetchChatResponse(chatHistory)).title;
    const closestIngredient = (await fetchSearchResults(closestIngredientTitle, 1))[0];
    console.log("closestIngredient", closestIngredient);
    recipe.ingredients.priced[i] = {
      fromRecipe: ingredient.fromRecipe,
      fromStore: closestIngredient as any,
    };
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
      content: `You've generated the following recipe with the ingredients labeled "fromRecipe". 
      Then you tried to match those ingredients with ingredients from the grocery store and labeled them "fromStore", but not all ingredients were a perfect match, and some had to be substituted.
      Now you need to analyze the recipe and finalize it. This means adjusting any fields but ingredients so that it all flows and makes sense with the new ingredients.
      present it in the same JSON format.

      The Recipe:
      ${JSON.stringify(recipe)}
      `,
    },
  ];
  const finalRecipe = JSON.parse(await fetchChatResponse(chatHistory));
  const output = {
    title: finalRecipe.title,
    cuisine: finalRecipe.cuisine,
    description: finalRecipe.description,
    serves: finalRecipe.serves,
    prepTime: finalRecipe.prepTime,
    cookTime: finalRecipe.cookTime,
    ingredients: [
      ...finalRecipe.ingredients.priced.map((item: any) => {
        return {
          title: item.fromStore.title,
          quantity: item.fromStore.quantity,
          currentPrice: item.fromStore.currentPrice,
          onSale: item.fromStore.onSale,
          amountToBuy: item.fromStore.amountToBuy,
        };
      }),
      ...finalRecipe.ingredients.unpriced.map((item: any) => ({
        title: item.title,
        quantity: `${item.amount} ${item.units}`,
        currentPrice: 0,
        onSale: false,
        amountToBuy: 0,
      })),
    ],
    instructions: finalRecipe.instructions,
    costPerServing: finalRecipe.costPerServing,
    regularPriceCostPerServing: finalRecipe.regularPriceCostPerServing,
    totalCost: finalRecipe.totalCost,
    regularPriceTotalCost: finalRecipe.regularPriceTotalCost,
    discount: finalRecipe.discount,
  };
  return output;
}
