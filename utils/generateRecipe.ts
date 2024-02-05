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
}

interface RecipePreview {
  title: string;
  description: string;
  image: string;
  dietaryRestrictions: DietaryRestrictions[];
}

export async function generateRecipePreview(
  dietaryRestrictions: DietaryRestrictions[] = [],
  progressCallback: (status: string, progress: number) => void
): Promise<RecipePreview> {
  // progressCallback("Looking at Whats on Sale", 0);
  // const proteinsOnSale = await getProteins();
  const cuisine =
    Object.values(Cuisines)[Math.floor(Math.random() * Object.values(Cuisines).length)];
  progressCallback("Thinking of a Recipe", 0.3);
  const previousRecipes = await getPreviousRecipes();
  const recipeIdea = await generateRecipeIdea([], dietaryRestrictions, cuisine, previousRecipes);
  const RecipePreview = {
    title: recipeIdea.title,
    description: recipeIdea.description,
    image: "",
    dietaryRestrictions: dietaryRestrictions,
  };
  progressCallback("Taking a picture", 0.7);
  const recipeWithImage = await generateImageForRecipe(RecipePreview);
  return recipeWithImage;
}

export async function generateRecipe(
  dietaryRestrictions: DietaryRestrictions[] = [],
  progressCallback: (status: string, progress: number) => void
): Promise<Recipe> {
  // progressCallback("Looking at Whats on Sale", 0);
  // const proteinsOnSale = await getProteins();
  progressCallback("Thinking of a Recipe", 0.1);
  const previousRecipes = await getPreviousRecipes();
  const cuisine =
    Object.values(Cuisines)[Math.floor(Math.random() * Object.values(Cuisines).length)];
  progressCallback("Thinking of a Recipe", 0.3);
  const recipeIdea = await generateRecipeIdea([], dietaryRestrictions, cuisine, previousRecipes);
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
  console.log("PRICED RECIPE", pricedRecipe);
  const recipeWithCosts = calculateCosts(pricedRecipe);
  console.log("RECIPE WITH COSTS", recipeWithCosts);
  progressCallback("Doing a Taste Test", 0.7);
  const finalizedRecipeFields = await finalizeRecipe(recipeWithCosts);
  const finalizedRecipe = { ...recipeWithCosts, ...finalizedRecipeFields };
  console.log("FINALIZED RECIPE", finalizedRecipe);

  progressCallback("Crunching some numbers", 0.8);
  const leftovers = await calculateLeftovers(finalizedRecipe);
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
  progressCallback("Taking a Picture", 0.85);
  const recipeWithImage = await generateImageForRecipe(recipeWithLeftovers);

  // save recipe to database
  progressCallback("Saving recipe", 0.95);
  console.log("SAVING RECIPE", recipeWithImage);
  const response = await fetch(
    `/api/saveRecipe?query=${encodeURIComponent(JSON.stringify(recipeWithImage))}`
  );
  progressCallback("Finished", 1);
  return { ...recipeWithImage, response: response.json() };
}

async function getProteins(): Promise<Ingredient[]> {
  const threshold = 0.1;
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
    title: recipeIdea.title,
    cuisine: recipeIdea.cuisine,
    description: recipeIdea.description,
    serves: recipeIdea.serves,
    ingredients: recipeIdea.ingredients,
    unpricedIngredients: recipeIdea.unpricedIngredients,
    instructions: response.instructions,
    prepTime: response.prepTime,
    cookTime: response.cookTime,
    dietaryRestrictions: recipeIdea.dietaryRestrictions,
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
  console.log(chatHistory);
  const finalRecipe = JSON.parse(await fetchChatResponse(chatHistory));
  return finalRecipe;
}

async function generateImageForRecipe(recipe: any) {
  const openAIImageURL = (await generateImage(await generateImagePreamble(recipe))).url;
  // replace title with a filename safe title
  const blobUrl = await downloadAndSaveImage(
    openAIImageURL,
    `${recipe.title.replace(/\s/g, "_")}.png`
  );
  recipe.image = blobUrl;
  console.log("RECIPE WITH IMAGE: ", recipe);
  return recipe;
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
    leftovers.push(...response.leftovers);
  }
  return leftovers as any[];
}
