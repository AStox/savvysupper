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
  ${
    !!dietaryRestrictions && dietaryRestrictions.length > 0
      ? `Your recipe must be ${dietaryRestrictions.join(", ")}.`
      : ""
  }

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
    priced: {title: "string", amount: number, units: "string"}[],
    unpriced: {title: "string", amount: number, units: "string"}[]
  },
}
  priced ingredients' units should be one of the following: "g", "ml", "tsp", "tbsp", "cup", "oz", "lb", "count"
  unpriced units can be whatever makes sense.
  Unpriced ingredients should be common pantry items like cooking oils, vinegars, sauces like Soy sauce, Worcestershire sauce, Hot sauce, condiments like  Mustard, Ketchup, Mayonnaise, spices and dried herbs like cinnamon, cumin, dried rosemary, etc.
  Unpriced ingredients should not include things like fresh herbs, like fresh basil, fresh rosemary, fresh thyme, etc.
  Keep the ingredients as generic as possible except in cases where it's an important destinction. For exmaple, use "bread crumbs" instead of "whole grain bread crumbs", but use "fresh basil" or "dry basil" instead of "basil".
  Optimize for cost, even if that means buying in bulk.

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
} recipe. 
Return responses in valid JSON following this example:
{
  title: string;
  amount: string;
  units: string;
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
    amount: item.amount,
    units: item.units,
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

  Choose a cuisine from the following list that best describes the recipe.
  ${Object.values(Cuisines).join(", ")}
  `;

export const generateImagePreamble = async (recipe: Recipe) => `
  A brightly lit, studio quality photo of the following recipe plated and ready to serve in a nice, cosy setting. The plated dish should be alone in the photo. 
  The meal should use realistic but bright colours and should look appetizing and delicious.

  Recipe:
    ${JSON.stringify({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.shoppingList?.map((item) => item.ingredient.title),
      instructions: recipe.instructions,
    })}
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
