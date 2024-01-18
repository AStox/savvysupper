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
  dietaryRestrictions: string[];
}

export enum DietaryRestrictions {
  Vegetarian = "Vegetarian",
  Vegan = "Vegan",
  DairyFree = "Dairy Free",
  GlutenFree = "Gluten Free",
  Keto = "Keto",
}

export enum Cuisines {
  Mexican = "Mexican",
  Italian = "Italian",
  Chinese = "Chinese",
  Indian = "Indian",
  Japanese = "Japanese",
  Greek = "Greek",
  French = "French",
  Thai = "Thai",
  Spanish = "Spanish",
  Mediterranean = "Mediterranean",
  American = "American",
  Moroccan = "Moroccan",
  Cajun = "Cajun",
  MiddleEastern = "Middle Eastern",
}

export async function generateRecipe(
  progressCallback: (status: string, progress: number) => void
): Promise<Recipe> {
  let cuisine = Cuisines.Italian;
  let dietaryRestrictions = [DietaryRestrictions.GlutenFree];
  progressCallback("Looking at Whats on Sale", 0);
  const proteinsOnSale = await getProteins();
  progressCallback("Thinking of a Recipe", 0.1);
  const recipeIdea = await generateRecipeIdea(proteinsOnSale, cuisine, dietaryRestrictions);
  (recipeIdea as any).dietaryRestrictions = dietaryRestrictions;
  console.log("RECIPE IDEA", recipeIdea);
  progressCallback("Choosing Ingredients", 0.2);
  const recipeIngredients = await generateRecipeIngredients(recipeIdea as any);
  console.log("RECIPE INGREDIENTS", recipeIngredients);
  progressCallback("Writing Instructions", 0.35);
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

async function getProteins(): Promise<Ingredient[]> {
  return [
    ...(await fetchSearchResults("Beef", 3, true)),
    ...(await fetchSearchResults("Veal", 3, true)),
    ...(await fetchSearchResults("Chicken", 3, true)),
    ...(await fetchSearchResults("Pork", 3, true)),
    ...(await fetchSearchResults("Turkey", 3, true)),
    ...(await fetchSearchResults("Lamb", 3, true)),
    ...(await fetchSearchResults("Fish", 3, true)),
    ...(await fetchSearchResults("Seafood", 3, true)),
    ...(await fetchSearchResults("Bacon", 3, true)),
    ...(await fetchSearchResults("Sausages", 3, true)),
  ];
}

async function generateRecipeIdea(
  proteinsOnSale: Ingredient[],
  cuisine?: string,
  dietaryRestrictions?: string[]
): Promise<{
  title: string;
  protein: string;
  description: string;
  serves: number;
  cuisine: string;
}> {
  const preamble = await generateRecipeIdeaPreamble(proteinsOnSale, cuisine, dietaryRestrictions);
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
  dietaryRestrictions: string[];
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
    dietaryRestrictions: recipeIdea.dietaryRestrictions,
  };
}

async function generateRecipeInstructions(recipeIdea: {
  title: string;
  cuisine: string;
  protein: string;
  description: string;
  serves: number;
  ingredients: any;
  dietaryRestrictions: string[];
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
    dietaryRestrictions: recipeIdea.dietaryRestrictions,
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
    console.log("Looking for Ingredient:", ingredient.title);

    const findClosestIngredient = async (
      ingredient: { title: string; amount: number; units: string },
      tryAgain: boolean
    ) => {
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
          }`,
        },
        {
          role: "user",
          content: `I am looking for ${ingredient.amount}${ingredient.units} of ${
            ingredient.title
          } for this recipe: ${recipe.title}. Ingredients must be ${recipe.dietaryRestrictions.join(
            ", "
          )}.
        While focusing on cost savings, tell me which of the following grocery items I should buy and how many of it I should buy.
        Amounts don't need to be exact, but should be close. If the recipe calls for 500g of chicken, 400g is fine. Don't buy two of the chicken in this case.
        But if the recipe calls for 500g of chicken, 250g is not enough. Buy more than one of the chicken in this case.
        ${JSON.stringify(
          results.map((item: any) => ({
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
        `,
        },
      ];

      const response = JSON.parse(await fetchChatResponse(chatHistory));
      return response;
    };
    let fromChat = await findClosestIngredient(ingredient, true);
    if (fromChat.newTitle) {
      console.log("TRYING AGAIN WITH NEW TITLE", fromChat.newTitle);
      fromChat = await findClosestIngredient(
        {
          title: fromChat.newTitle,
          amount: ingredient.amount,
          units: ingredient.units,
        },
        false
      );
    }

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
      It's also possible that the dietary restrictions labels missing or incorrect.
      Adjust the title, description, dietary restrctions, cuisine, and instructions to match the shopping list. Do not include brand names anywhere.
      The title should be short and avoid using brand names or too many adjectives to describe things the dish.
      The title should make the dish sound appetizing and unique.
      present it in the following JSON format:
      
      {
        title: string;
        description: string;
        instructions: string[];
        dietaryRestrictions: string[];
        cuisine: string;
      }

      The Recipe:
      ${JSON.stringify(recipe)}

      Possible Dietary Restrictions:
      ${Object.values(DietaryRestrictions).join(", ")}

      Possible Cuisines:
      ${Object.values(Cuisines).join(", ")}
      `,
    },
  ];
  const finalRecipe = JSON.parse(await fetchChatResponse(chatHistory));
  return finalRecipe;
}

async function generateImageForRecipe(recipe: Recipe) {
  const openAIImageURL = (
    await generateImage(`
    A studio quality photo of the following recipe plated and ready to serve in a nice, cosy setting:
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
