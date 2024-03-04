import {
  generateFinalizeRecipePreamble1,
  generateFinalizeRecipePreamble2,
  generateImagePreamble,
  generateLeftoversPreamble,
  generatePricingIngredientsPreamble,
  generateRecipeIdeaPreamble,
  generateRecipeIngredientsPreamble,
  generateRecipeInstructionsPreamble,
} from "./prompts/preamble";
import { fetchChatResponse } from "./chat";
import { fetchSearchResults } from "./search";
import prisma from "@/lib/prisma";
import { Ingredient } from "@prisma/client";
import { generateImage } from "./image";
import { downloadAndSaveImage } from "./downloadAndSaveImage";
import { fetchSaleProteins } from "./chat/fetchSaleProteins";

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
    title: string;
    amount: number;
    units: string;
  }[];
  unpricedIngredients: {
    title: string;
    amount: number;
    units: string;
  }[];
  shoppingList: {
    ingredient: Ingredient;
    recipeIngredientTitle: string;
    amountLeftover: number;
    units: string;
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
  Korean = "Korean",
  Vietnamese = "Vietnamese",
  Brazilian = "Brazilian",
  Ethiopian = "Ethiopian",
  British = "British",
  Irish = "Irish",
  German = "German",
  Russian = "Russian",
  Caribbean = "Caribbean",
}

interface RecipePreview {
  title: string;
  description: string;
  image: string;
  dietaryRestrictions: DietaryRestrictions[];
}

export async function generateRecipe(
  dietaryRestrictions: DietaryRestrictions[] = [],
  progressCallback: (status: string, progress: number) => void
): Promise<Recipe> {
  progressCallback("Thinking of a Recipe", 0.1);
  const previousRecipes = await getPreviousRecipes();
  const cuisine =
    Object.values(Cuisines)[Math.floor(Math.random() * Object.values(Cuisines).length)];
  const proteins = await fetchSaleProteins();
  progressCallback("Thinking of a Recipe", 0.2);
  const recipeIdea = await generateRecipeIdea(
    proteins,
    dietaryRestrictions,
    cuisine,
    previousRecipes
  );
  (recipeIdea as any).dietaryRestrictions = dietaryRestrictions;
  console.log("RECIPE IDEA", recipeIdea);

  // Start image generation asynchronously
  const recipeImagePromise = generateImageForRecipe(recipeIdea);

  progressCallback("Choosing Ingredients", 0.3);
  const recipeIngredients = await generateRecipeIngredients(recipeIdea as any);
  console.log("RECIPE INGREDIENTS", recipeIngredients);

  // Run recipe instructions generation and ingredient pricing concurrently
  const [recipeInstructions, pricedRecipe] = await Promise.all([
    generateRecipeInstructions(recipeIngredients),
    priceIngredients(recipeIngredients),
  ]);

  console.log("RECIPE INSTRUCTIONS", recipeInstructions);
  console.log("PRICED RECIPE", pricedRecipe);

  progressCallback("Making a Shopping List", 0.5);
  // Perform operations that require the priced recipe
  const validShoppingList = pricedRecipe.shoppingList.every((item) => {
    if (!item.ingredient.title) {
      console.log("ERROR missing ingredient: ", item);
      throw new Error("Missing ingredient title");
    }
    return true;
  });

  if (!validShoppingList) {
    throw new Error("Shopping list validation failed.");
  }
  console.log("VALIDATED SHOPPING LIST", pricedRecipe.shoppingList);

  // Calculate Costs for the recipe
  const recipeWithCosts = calculateCosts(pricedRecipe);
  console.log("RECIPE WITH COSTS", recipeWithCosts);

  // Finalizing the Recipe with any last minute adjustments

  progressCallback("Doing a Taste Test", 0.7);
  const finalizedRecipeFields = await finalizeRecipe({
    ...recipeWithCosts,
    instructions: recipeInstructions.instructions as string[],
    prepTime: recipeInstructions.prepTime as number,
    cookTime: recipeInstructions.cookTime as number,
  });
  const finalizedRecipe = {
    ...recipeWithCosts,
    ...finalizedRecipeFields,
    instructions: recipeInstructions.instructions as string[],
    prepTime: recipeInstructions.prepTime as number,
    cookTime: recipeInstructions.cookTime as number,
  };
  console.log("FINALIZED RECIPE", finalizedRecipe);

  progressCallback("Crunching some numbers", 0.8);
  const leftovers = await calculateLeftovers(finalizedRecipe);
  console.log("LEFTOVERS", leftovers);
  const recipeWithLeftovers = {
    ...finalizedRecipe,
    shoppingList: finalizedRecipe.shoppingList.map((item) => ({
      ...item,
      amountLeftover: leftovers.find(
        (leftover) => leftover.title.toLowerCase() === item.ingredient.title.toLowerCase()
      )?.amountLeftover,
      units: leftovers.find(
        (leftover) => leftover.title.toLowerCase() === item.ingredient.title.toLowerCase()
      )?.units,
    })),
  };
  console.log("RECIPE WITH LEFTOVERS", recipeWithLeftovers);

  // Wait for the image promise here if the image is needed for the next steps
  const recipeImage = await recipeImagePromise;

  const recipeWithImage = { ...recipeWithLeftovers, image: recipeImage };
  console.log("RECIPE WITH IMAGE", recipeWithImage);

  // Save recipe to database
  progressCallback("Saving recipe", 0.95);
  const response = await fetch(
    `/api/saveRecipe?query=${encodeURIComponent(JSON.stringify(recipeWithImage))}`
  );
  progressCallback("Finished", 1);
  return { ...recipeWithImage, response: await response.json() } as Recipe;
}

async function getProteins(): Promise<Ingredient[]> {
  const threshold = 0.1;
  // const highestSale =
  const proteins = [
    ...(await fetchSearchResults("Steak", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Veal", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Chicken", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Pork", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Turkey", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Lamb", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Fish", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Seafood", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Bacon", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Sausages", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Tofu", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Tempeh", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Lentils", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Chickpeas", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Beans", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Quinoa", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
    ...(await fetchSearchResults("Eggs", 3, true)).filter(
      (item: any) => item.similarity > threshold
    ),
  ];
  return proteins;
}

async function getPreviousRecipes(): Promise<string[]> {
  const recipes = await fetch("/api/getRecipes").then((res) => res.json());
  return recipes?.map((recipe: Recipe) => recipe.title);
}

async function generateRecipeIdea(
  proteinsOnSale: Ingredient[],
  dietaryRestrictions: string[],
  cuisine: string,
  previousRecipes: string[]
): Promise<{
  title: string;
  protein: string;
  description: string;
  serves: number;
  cuisine: string;
}> {
  const preamble = await generateRecipeIdeaPreamble(
    proteinsOnSale,
    dietaryRestrictions,
    cuisine,
    previousRecipes,
    []
  );
  console.log("generateRecipeIdea PREAMBLE", preamble);
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
    cuisine: cuisine,
  } as any;
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
  console.log("generateRecipeIngredients PREAMBLE", preamble);
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
    ingredients: response.ingredients.priced,
    unpricedIngredients: response.ingredients.unpriced,
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
  unpricedIngredients: any;
  dietaryRestrictions: string[];
}): Promise<Partial<Recipe>> {
  const preamble = await generateRecipeInstructionsPreamble(recipeIdea);
  console.log("generateRecipeInstructions PREAMBLE", preamble);
  let chatHistory = [
    {
      role: "user",
      content: preamble,
    },
  ];

  const response = JSON.parse(await fetchChatResponse(chatHistory));
  return {
    instructions: response.instructions,
    prepTime: response.prepTime,
    cookTime: response.cookTime,
  };
}

function calculateCosts(pricedRecipe: Recipe) {
  let recipeWithCosts = {
    ...pricedRecipe,
    totalCost: pricedRecipe.shoppingList.reduce(
      (acc, item) => acc + item.ingredient.currentPrice,
      0
    ),
    regularPrice: pricedRecipe.shoppingList.reduce(
      (acc, item) => acc + item.ingredient.regularPrice,
      0
    ),
  };
  return recipeWithCosts;
}

async function priceIngredients(recipe: Recipe) {
  recipe.shoppingList = [];
  await Promise.all(
    recipe.ingredients.map(async (ingredient, i) => {
      const firstIngredient = ingredient.title;
      console.log("Looking for Ingredient:", firstIngredient);

      const findClosestIngredient = async (
        ingredient: { title: string; amount: number; units: string },
        tryAgain: boolean
      ) => {
        const results = await fetchSearchResults(ingredient.title, 10, false);
        const chatHistory = [
          {
            role: "user",
            content: await generatePricingIngredientsPreamble(
              ingredient,
              results,
              recipe,
              tryAgain
            ),
          },
        ];

        const response = JSON.parse(await fetchChatResponse(chatHistory));
        return response;
      };

      let fromChat = await findClosestIngredient(ingredient, true);
      const secondIngredient = fromChat.title;
      if (fromChat.newTitle) {
        console.log(`Couldn't find ${firstIngredient}, trying ${fromChat.newTitle} instead`);
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
      if (!closestIngredient) {
        recipe.shoppingList[i] = {
          error: `Could not find ${firstIngredient}${
            secondIngredient ? ` or ${secondIngredient}` : ""
          }`,
        } as any;
      }
      recipe.shoppingList[i] = {
        ingredient: { ...closestIngredient },
        amountToBuy: fromChat.amountToBuy,
        recipeIngredientTitle: ingredient.title,
      } as any;
    })
  );
  return recipe;
}

async function finalizeRecipe(
  recipe: Recipe
): Promise<{ title: string; description: string; instructions: string[] }> {
  const chatHistory = [
    {
      role: "user",
      content: await generateFinalizeRecipePreamble1(recipe),
    },
  ];
  const response = await fetchChatResponse(chatHistory);
  chatHistory.push({
    role: "assistant",
    content: response,
  });
  chatHistory.push({
    role: "user",
    content: await generateFinalizeRecipePreamble2(),
  });
  const finalRecipe = JSON.parse(await fetchChatResponse(chatHistory));
  return finalRecipe;
}

async function generateImageForRecipe(recipe: any) {
  const prompt = await generateImagePreamble(recipe);
  console.log("generateImageForRecipe PROMPT", prompt);
  const openAIImageURL = (await generateImage(prompt)).url;
  const blobUrl = await downloadAndSaveImage(
    openAIImageURL,
    `${recipe.title.replace(/\s/g, "_")}.png`
  );
  return blobUrl;
}

async function calculateLeftovers(meal: Recipe): Promise<any[]> {
  const leftovers = [];
  for (const ingredient of meal.ingredients) {
    const preamble = await generateLeftoversPreamble(
      ingredient,
      meal.shoppingList.find((item) => item.recipeIngredientTitle === ingredient.title)
    );
    console.log("calculateLeftovers PREAMBLE", preamble);
    let chatHistory = [
      {
        role: "user",
        content: preamble,
      },
    ];
    const response = JSON.parse(await fetchChatResponse(chatHistory));
    console.log("calculateLeftovers RESPONSE", response);
    leftovers.push(...response.leftovers);
  }
  return leftovers as any[];
}
