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
import { Cuisines, DietaryRestrictions, Recipe } from "../generateRecipe";

export const generateRecipeIdeaPreamble = async (
  proteinsOnSale: Ingredient[],
  dietaryRestrictions: string[],
  cuisine: string,
  previousRecipes: string[],
  ingredients: Ingredient[]
) => `Generate a ${cuisine} recipe.
  Try to avoid generating anything too similar to these: ${previousRecipes.join(", ")}
  The recipe should be something that only uses ingredients that are likely to be sold at major Canadian grocery stores, like sobeys, metro, loblaws, etc.
  These meals are meant to be cost-saving, and simple to make, so don't include anything too fancy or expensive, but don't be afraid to get creative.
  The meal can be any number of servings, but should be at least 2 servings and should be a complete meal. Don't generate sides, snacks, or smaller dishes unless also accompanied by something else to complete a full meal.
  Don't include the cuisine in the title. For example, "American turkey meatloaf" should just be "Turkey Meatloaf".
  If the common name for the recipe is in another language, don't translate it to english, unless you think Canadians wouldn't recognize it. Like "pad gra prow" instead of "Thai Basil Chicken", but something like "Rigatoni con Salsiccia e Crema di Zucca" should be "Rigatoni with Creamy Pumpkin Sauce", "Espinacas con Garbanzos" should be "Spinach with Chickpeas".
  Remember that this is for Canadians, so if the common name is in another language, and you think Canadians wouldn't recognize it, then translate it to english.
  The title should be short, no more than 4 or 5 words. 
  ${
    !!dietaryRestrictions && dietaryRestrictions.length > 0
      ? `Your recipe must be ${dietaryRestrictions.join(", ")}.`
      : ""
  }
  The following are the ingredients that are the most discounted at the store right now, in order of greatest discount to least discount.
  You can use these as a starting point for your recipe idea, especially proteins, but you're generating recipes for a website so make sure to avoid repeating yourself using the listed recipes above.
  ${JSON.stringify(
    proteinsOnSale.map((item: any) => ({
      title: item.title,
      price: item.currentPrice.toFixed(2),
      discount: (item.regularPrice - item.currentPrice).toFixed(2),
      amount: item.amount,
      units: item.units,
    }))
  )}

  Return one recipe in JSON following this example:
  {
    protein: string,
    title: string,
    description: string,
    serves: number,
  }
  `;

// proteins on sale: ${proteinsOnSale.map((protein) => protein.title).join(", ")}

export const generateRecipeIngredientsPreamble = async (
  recipeIdea: Partial<Recipe>
) => `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
given the following recipe idea, choose the ingredients and return them following this example JSON:
{
  ingredients: {
    priced: {title: string, amount: number, units: string, category: string}[],
    unpriced: {title: string, amount: number, units: string}[]
  },
}
  Categories should be something like "fruit", "vegetable", "beef", "chicken", "cheese", "grain", etc.
  priced ingredients' units should be one of the following: "g", "ml", "tsp", "tbsp", "cup", "oz", "lb", "count"
  unpriced units can be whatever makes sense.
  Priced ingredients are all the major ingredients of the recipe, like proteins, vegetables, grains, etc.
  unpriced ingredients are minor ingredients, like spices, oils, vinegars, etc.
  Common pantry items like cooking oils, olive oil, vegetable oil, vinegars, sauces like Soy sauce, Worcestershire sauce, Hot sauce, condiments like  Mustard, Ketchup, Mayonnaise, spices and dried herbs like cinnamon, cumin, dried rosemary should all be unpriced ingredients. Other unpriced ingredients could be things like salt, pepper, sugar, flour, etc.
  This is a recipe for Canadians so non-Canadian, International or uncommon spices should be priced. Some examples: Garam Masala, Sumac, Za'atar, turmeric, Dashi, tamarind paste, etc.
  Unpriced ingredients should not include things like fresh herbs, like fresh basil, fresh rosemary, fresh thyme, etc.
  Keep the ingredients as generic as possible except in cases where it's an important destinction. For exmaple, use "bread crumbs" instead of "whole grain bread crumbs", but use "fresh basil" or "dry basil" instead of "basil".
  Optimize for cost, even if that means buying in bulk.
  These meals are meant to be cost-saving and simple to make, so don't include anything too fancy or expensive.
  If the recipe has any dietary restrictions then you should only include ingredients that fit those restrictions.

  Recipe:
  ${recipeIdea.title}
  ${recipeIdea.description}
  Dietary restrictions: ${
    recipeIdea.dietaryRestrictions ? recipeIdea.dietaryRestrictions.join(", ") : "None"
  }
  Serves: ${recipeIdea.serves}
`;

export const generateRecipeInstructionsPreamble = async (
  recipeIdea: Partial<Recipe>
) => `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
given the following recipe, come up with the instructions and return them following this example JSON:
{
  instructions: string[],
  prepTime: number,
  cookTime: number,
}

  Recipe:
  ${recipeIdea.title}
  ${recipeIdea.description}
  Serves: ${recipeIdea.serves}
  Ingredients: ${recipeIdea.ingredients
    ?.map((item: any) => item.title)
    .join(", ")}, ${recipeIdea.unpricedIngredients?.map((item: any) => item.title).join(", ")}
`;

export const generatePricingIngredientsPreamble = async (
  recipeIngredient: { amount: number; units: string; title: string },
  storeItems: Ingredient[],
  recipe: Partial<Recipe>,
  tryAgain = false
) => `You are a helpful algorithm designed to choose ingredients from the grocery store for a ${
  recipe.title
} recipe. You are trying to optimize for cost savings.
Return responses in valid JSON following this example:
{
  title: string;
  amountToBuy: number;
}

I am looking for ${recipeIngredient.amount} ${recipeIngredient.units} of ${
  recipeIngredient.title
} for this recipe: ${recipe.title}. ${
  (recipe.dietaryRestrictions?.length || 0) > 0
    ? `Ingredients must be ${recipe.dietaryRestrictions?.join(", ")}.`
    : `This recipe has no dietary restrictions.`
} 
Avoid ingredients that are for a specific dietary restriction unless it's necessary for the recipe. For example, don't choose a gluten-free flour if the recipe isn't gluten-free.)
Prefer unprocessed, whole ingredients over processed or flavoured. So choose something like "chicken broth" over "turmeric and ginger chicken broth".
While focusing on cost savings, tell me which of the following grocery items I should buy and how many of it I should buy.
Amounts don't need to be exact, but should be close. If the recipe calls for 500g of chicken, 400g is fine. Don't buy two of the chicken in this case.
But if the recipe calls for 500g of chicken, 250g is not enough. Buy more than one of the chicken in this case.
When it comes to bell peppers, for example, if the recipe calls for 2 bell peppers, and the store sells them individually, you should buy two. If the store sells them in a mix pack of 3, you should buy 1 pack.

${JSON.stringify(
  storeItems.map((item: any) => ({
    title: item.title,
    price: item.currentPrice.toFixed(2),
    discount: (item.regularPrice - item.currentPrice).toFixed(2),
    amount: item.amount,
    units: item.units,
  }))
)}

${
  tryAgain
    ? `If the item I'm looking for is not in the list, tell me a substitute I should look for instead. Return it in the following format:
{
newTitle: string; 
newCategory: string;
}`
    : ``
}
`;

export const generateFinalizeRecipePreamble1 = async (
  recipe: Recipe
) => `You are a helpful algorithm designed to develop recipes based on grocery store sale data.
You've generated the following recipe, then from a list of available grocery items, you chose the shopping list for this recipe. It's possible not all items match the original recipe, either in type or quantity.
  It's also possible that the dietary restrictions are missing or incorrect.
  Adjust the title, description, and instructions to match the shopping list. Do not include brand names anywhere.
  The title should just be the same as the original recipe's title, but fix any inconsistencies, as ingredients may have been changed.
  Don't mention ingredient amounts in the instructions unless absolutely necessary, in which case, err on the side of the recipe's original amounts.
  Update the description to fix any inconsistencies, as ingredients may have been changed.
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
  return just the adjusted fields in JSON like so:
  {
    cuisine: string;
    dietaryRestrictions: string[];
  }
  
  Choose all dietary restrictions from the following list that apply to the recipe.

  Possible dietary restrictions:
  ${Object.values(DietaryRestrictions).join(", ")}

  Choose a cuisine from the following list that best describes the recipe.
  ${Object.values(Cuisines).join(", ")}
  `;

export const generateImagePreamble = async (recipe: Recipe) => `
  A bright top-down lit, shadowless, studio quality photo of the following recipe plated and ready to serve in a nice, modern and clean setting. The plated dish should be alone in the photo. 
  The photo should resemble those from a recipe website, like NYT Cooking, Bon Appetit Magazine or Food 52.
  Use only the ingredients in the recipe and ensure they look as realistic as possible. Do not add ingredients, and do not use unnatural shapes or colours.
  The photo should be taken from a 45 degree angle, and the dish should be centered, in focus and taking up at least 90% of the image
  All ingredients should be shown processed. That means no full onions, but rather chopped onions. No full chickens, but rather chicken breasts or thighs. No whole fish, but rather fillets or chunks.

  Recipe:
    name: ${recipe.title}
    cuisine: ${recipe.cuisine}
    description: ${recipe.description}}
  `;

export const generateLeftoversPreamble = (ingredient: any, groceryItem: any) => `
    Take a look at this recipe ingredient and the associated grocery item I bought for it.
    figure out how much of my ingredient, if any, will be leftover after using it in the recipe.

    Return a JSON object in the following format, with an object containing a title (the shopping list item's title), amountLeftover, and units field for each ingredient in the recipe's shopping list:
    { leftovers: [
        {
          title: string;
          amountLeftover: number;
          units: string;
        }
      ]
    }

    Recipe's ingredient:
    ${ingredient.title}: ${ingredient.amount} ${ingredient.units}

    Grocery Item:
    ${groceryItem.ingredient.title}: ${groceryItem.ingredient.amount}${groceryItem.ingredient.units}. Amount to buy: ${groceryItem.amountToBuy}
  `;

export const generateNextRecipePreamble = (
  leftovers: { title: string; amountLeftOver: number; units: string }[],
  ingredientLists: { title: string; amount: number; units: string; amountToBuy: number }[][]
) => `
      I'm going to show you a list of leftovers and a list of possible ingredients lists. I want you to choose the ingredient list that most closely matches the leftovers I have.
      
      Return the index of the ingredient list that most closely matches the leftovers in JSON like so:
      {
        index: number;
      }

      My leftovers:
      ${leftovers.map((item) => `${item.title}: ${item.amountLeftOver} ${item.units}`).join("\n")}

      Possible ingredient lists:
      ${ingredientLists
        .map(
          (list, index) =>
            `${index}: ${list
              .map(
                (item) =>
                  `${item.title}: ${item.amount}${item.units}. amountToBuy: ${item.amountToBuy}`
              )
              .join("\n")}`
        )
        .join("\n\n")}
`;

export const generateChatQueryPreamble = () => `
You are an ai assistant taking in plane text from users about what kind of meal plan they would like and outputting a json object that contains a prisma query to get meals that match their criteria.
Below is the recipe table schema that you will be querying:
\`\`\`
model Ingredient {
  id          String             @default(cuid()) @id
  title       String
  amount      Float
  units       String
  category    String
  currentPrice Float
  regularPrice Float
  perUnitPrice Float
  discount    Float
  onSale      Boolean
  dateAdded   DateTime           @default(now())
  RecipeIngredient RecipeIngredient[]

  embedding   Unsupported("vector(3072)")?

  @@map("ingredients")
}

model Recipe {
  id            String             @default(cuid()) @id
  title         String
  image         String?
  cuisine       String
  description   String
  serves        Int
  prepTime      Int
  cookTime      Int
  ingredients   Json
  unpricedIngredients Json
  shoppingList  RecipeIngredient[]
  instructions  Json
  totalCost     Float
  regularPrice  Float
  dietaryRestrictions Json
}

model RecipeIngredient {
  ingredientId String
  recipeId     String
  amountToBuy  Int
  amountLeftover Int
  units       String
  recipeIngredientTitle String

  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
  recipe       Recipe     @relation(fields: [recipeId], references: [id])

  @@id([ingredientId, recipeId])
}
\`\`\`
available cuisines are: ${Object.values(Cuisines).join(", ")}
available Dietary Restrictions are: ${Object.values(DietaryRestrictions).join(", ")}

Your returned JSON should be in the following format:
{
rawSql: \`
SELECT 
    r.id,
    r.title,
    r.image,
    r.cuisine,
    r.description,
    r.serves,
    r."prepTime",
    r."cookTime",
    r.ingredients,
    r."unpricedIngredients",
    r.instructions,
    r."totalCost",
    r."regularPrice",
    r."dietaryRestrictions",
    json_agg(json_build_object(
        'ingredientId', ri."ingredientId",
        'recipeId', ri."recipeId",
        'amountToBuy', ri."amountToBuy",
        'amountLeftover', ri."amountLeftover",
        'units', ri.units,
        'recipeIngredientTitle', ri."recipeIngredientTitle",
        'ingredient', json_build_object(
            'id', i.id,
            'title', i.title,
            'amount', i.amount,
            'units', i.units,
            'category', i.category,
            'currentPrice', i."currentPrice",
            'regularPrice', i."regularPrice",
            'perUnitPrice', i."perUnitPrice",
            'discount', i.discount,
            'onSale', i."onSale"
        )
    )) AS "shoppingList"
FROM recipes r
JOIN "RecipeIngredient" ri ON r.id = ri."recipeId"
JOIN ingredients i ON ri."ingredientId" = i.id
WHERE 
    r."dietaryRestrictions" @> '["Vegan"]' AND
    EXISTS (
        SELECT 1
        FROM "RecipeIngredient" ri2
        JOIN ingredients i2 ON ri2."ingredientId" = i2.id
        WHERE ri2."recipeId" = r.id AND (
          LOWER(i2.title) LIKE '%chickpeas%' OR
          LOWER(i2.title) LIKE '%chickpea%' OR
          LOWER(i2.title) LIKE '%chick peas%' OR
          LOWER(i2.title) LIKE '%chick pea%'
      )
    )
GROUP BY r.id
ORDER BY RANDOM()
LIMIT 5;
\`,
}

return 5 meals if not otherwise specified.
Add some randomization to the meals returned to make it more interesting.
`;
