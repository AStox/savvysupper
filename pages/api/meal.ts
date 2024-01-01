import { OpenAIChatClient } from "./_OpenAIChatClient";
import BeefAndVeal from "data/ingredients/Beef_&_Veal.json";
import Chicken from "data/ingredients/Chicken.json";
import Pork from "data/ingredients/Pork.json";
import Turkey from "data/ingredients/Turkey.json";
import Lamb from "data/ingredients/Lamb.json";
import Fish from "data/ingredients/Fish.json";
import ExoticMeats from "data/ingredients/Exotic_Meats.json";
import FishAndSeafood from "data/ingredients/Fish_&_Seafood.json";
import Bacon from "data/ingredients/Bacon.json";
import HotDogsAndSausages from "data/ingredients/Hot_Dogs_&_Sausages.json";
import { exampleRecipes } from "@/example_recipes";
import type { NextApiRequest, NextApiResponse } from "next";
import search from "./_searchCollection";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.status(500).send("No OpenAI API key found");
    return;
  }

  try {
    const preamble = `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
    The way you will do this is by choosing a protein source from the sale data a generating a realistic recipe using that protein.
    Recipes should be full meals. That means recipes should include a protein, a starch, and a vegetable.
    The recipes you generate are inspired by great celebrity chefs like Jamie Oliver, Gordon Ramsay, and Bobby Flay.
    Your recipes are delicious, diverse, healthy, and draw from multiple cultures and cuisines. Think outside the box!
    Don't make American cuisine every time. Try to make recipes from all over the world.
    Always return recipes in valid JSON following this example:

SAMPLE OF SALE DATA:
{
"title": "Chicken Leg Quarters Value Size 3-5 Pieces",
"quantity": "1.425kg",
"currentPrice": 12.54,
"onSale": true,
"regularPrice": 14.99
},

RESULTING RECIPE:
{
  protein: "Chicken Leg Quarters Value Size 3-5 Pieces",
  cuisine: "Mexican",
  title: "Sweet Potato and Chicken Hash",
  description: "A cozy, hearty meal to warm you on those cold winter nights. lots of protein and veggies to keep you full and healthy."
  serves: 4,
  ingredients: {
    priced:
      [
        {
          fromRecipe: {title: "sweet potatoes", amount: 0.2, units: "kg"}, 
        },
        {
          "fromRecipe": {"title": "chicken breasts", "amount": 4, "units": "items"},
        },
        {
          "fromRecipe": {"title": "red onion", "amount": 1, "units": "item"},
        },
        {
          "fromRecipe": {"title": "zucchini", "amount": 1, "units": "item"},
        },
        {
          "fromRecipe": {"title": "head of broccoli", "amount": 1, "units": "item"},
        },
        {
          "fromRecipe": {"title": "cooked brown rice", "amount": 0.5, "units": "cup"},
        },
      ],
    unpriced: [
      {title: "olive oil", amount: 1, units: "tablespoon"},
      {title: "salt", amount: 1, units: "teaspoon"},
      {title: "black pepper", amount: 1, units: "teaspoon"}
    ]
  },
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

Protein on Sale:
${JSON.stringify(
  [
    ...BeefAndVeal,
    ...Chicken,
    ...Pork,
    ...Turkey,
    ...Lamb,
    ...Fish,
    ...ExoticMeats,
    ...FishAndSeafood,
    ...Bacon,
    ...HotDogsAndSausages,
  ]
    .filter((item) => item.onSale)
    .sort((a, b) => b.regularPrice - b.currentPrice - (a.regularPrice - a.currentPrice))
    .slice(0, 10)
    .map((item) => ({
      title: item.title,
      discount: item.regularPrice - item.currentPrice,
    }))
)}
    `;

    let chatHistory = [
      {
        role: "system",
        content: preamble,
      },
    ];

    const chatClient = new OpenAIChatClient(apiKey);
    const recipe = JSON.parse(await chatClient.chat(chatHistory));
    console.log("RECIPE FROM API:", recipe);
    // const firstResponse = chatHistory;

    // console.log("FIRST RESPONSE FROM API:", firstResponse);

    // chatHistory.push({
    //   role: "assistant",
    //   content: JSON.stringify(firstResponse),
    // });
    // chatHistory.push({
    //   role: "user",
    //   content: `Now we will price the ingredients in this recipe.
    //   At the end of this prompt I will show you a list of available ingredients and their prices and you will find a price for each ingredient in the recipe.
    //   Only price ingredients that fall into the following categories: meats and seafood, fruits and vegetables, and carbohydrates and starches.
    //   If an ingredient can't be found in the list, try to replace it with a similar ingredient from the list.
    //   If there are no similar ingredients, then just leave the original ingredient in the recipe.

    //   Output the recipe the same as before, but with the prices of each ingredient listed next to it.
    //   If the ingredient is on sale, indicate that by showing the current price and the regular price.

    //   Here is the list of available ingredients and their prices:

    //     ${JSON.stringify([
    //       // ...meatAndSeafood
    //       //   .filter((item) => item.onSale)
    //       //   .map((item) => ({
    //       //     item: item.title,
    //       //     currentPrice: item.currentPrice,
    //       //     regularPrice: item.regularPrice,
    //       //   })),
    //       ...fruitAndVeg
    //         .filter((item) => item.onSale)
    //         .map((item) => ({
    //           item: item.title,
    //           currentPrice: item.currentPrice,
    //           regularPrice: item.regularPrice,
    //         })),
    //       // ...dairyAndEggs.map((item) => ({
    //       //   item: item.title,
    //       //   currentPrice: item.currentPrice,
    //       //   regularPrice: item.regularPrice,
    //       // })),
    //       // ...cheese.map((item) => ({
    //       //   item: item.title,
    //       //   currentPrice: item.currentPrice,
    //       //   regularPrice: item.regularPrice,
    //       // })),
    //     ])}
    //     `,
    // });
    // let secondResponse = JSON.parse(await chatClient.chat(chatHistory));

    let pricedRecipe = await priceIngredients(recipe);

    let pricedAndanalyzedRecipe = {
      ...pricedRecipe,
      costPerServing:
        pricedRecipe.ingredients.priced.reduce(
          (acc, item) => acc + item.fromStore.currentPrice,
          0
        ) / pricedRecipe.serves,
      regularPriceCostPerServing:
        pricedRecipe.ingredients.priced.reduce(
          (acc, item) => acc + item.fromStore.regularPrice,
          0
        ) / pricedRecipe.serves,
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
      chatHistory,
    };

    console.log("PRICED RECIPE:", pricedAndanalyzedRecipe);

    const finalizedRecipe = await finalizeRecipe(pricedAndanalyzedRecipe);

    // console.log("FINALIZED RECIPE:", finalizedRecipe);

    res.status(200).json(finalizedRecipe);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .send(`Error processing request:${error.stack}, ${error.name}, ${error.message}`);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
}

async function priceIngredients(recipe: any) {
  // for each ingredient in the recipe except the protein, do a vector search for the closest ingredient in the store and include it and its details in the recipe
  for (let i = 0; i < recipe.ingredients.priced.length; i++) {
    const ingredient = recipe.ingredients.priced[i];
    console.log(ingredient);
    const results = await search(ingredient.fromRecipe.title, 5);
    const chat = new OpenAIChatClient(process.env.OPENAI_API_KEY as string);
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
          results.map((item) => ({
            title: item.title,
            onSale: item.onSale,
            quantity: item.quantity,
          }))
        )}`,
      },
    ];

    const closestIngredientTitle = JSON.parse(await chat.chat(chatHistory)).title;
    const closestIngredient = (await search(closestIngredientTitle, 1))[0];
    console.log("closestIngredient", closestIngredient);
    recipe.ingredients.priced[i] = {
      fromRecipe: ingredient.fromRecipe,
      fromStore: closestIngredient,
    };
  }
  return recipe;
}

async function finalizeRecipe(recipe: any) {
  const chat = new OpenAIChatClient(process.env.OPENAI_API_KEY as string);
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
  const finalRecipe = JSON.parse(await chat.chat(chatHistory));
  const output = {
    title: finalRecipe.title,
    description: finalRecipe.description,
    serves: finalRecipe.serves,
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
