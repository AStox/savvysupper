import { OpenAIChatClient } from "./_OpenAIChatClient";
import meatAndSeafood from "../../Meat_&_Seafood_ingredients.json";
import fruitAndVeg from "../../Fresh_Fruits_&_Vegetables_ingredients.json";
import dairyAndEggs from "../../Dairy_&_Eggs_ingredients.json";
import cheese from "../../Cheese_ingredients.json";
import { exampleRecipes } from "@/example_recipes";
import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const MILVUS_HOST = "https://in03-9479dd5ae4f429f.api.gcp-us-west1.zillizcloud.com";
  const MILVUS_PORT = "19530";

  const milvusClient = new MilvusClient(`${MILVUS_HOST}:${MILVUS_PORT}`);

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
          fromStore: {title: "bag of potatoes", amount: 2, units: "kg",  currentPrice: 1.99, regularPrice: 2.99, perRecipeCost: 0.19}
        },
        {
          "fromRecipe": {"title": "chicken breasts", "amount": 4, "units": "items"},
          "fromStore": {"title": "pack of chicken breasts", "amount": 1, "units": "pack", "currentPrice": 5.99, "regularPrice": 12.99, "perRecipeCost": 5.99}
        },
        {
          "fromRecipe": {"title": "red onion", "amount": 1, "units": "item"},
          "fromStore": {"title": "red onion", "amount": 1, "units": "item", "currentPrice": 0.99, "regularPrice": 1.99, "perRecipeCost": 0.99}
        },
        {
          "fromRecipe": {"title": "zucchini", "amount": 1, "units": "item"},
          "fromStore": {"title": "zucchini", "amount": 1, "units": "item", "currentPrice": 0.88, "regularPrice": 1.29, "perRecipeCost": 0.88}
        },
        {
          "fromRecipe": {"title": "head of broccoli", "amount": 1, "units": "item"},
          "fromStore": {"title": "head of broccoli", "amount": 1, "units": "item", "currentPrice": 1.99, "regularPrice": 1.99, "perRecipeCost": 1.99}
        },
        {
          "fromRecipe": {"title": "cooked brown rice", "amount": 0.5, "units": "cup"},
          "fromStore": {"title": "bag of brown rice", "amount": 1, "units": "kg", "currentPrice": 1.99, "regularPrice": 1.99, "perRecipeCost": 0.25}
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
  meatAndSeafood
    .filter((item) => item.onSale)
    .sort((a, b) => b.regularPrice - b.currentPrice - (a.regularPrice - a.currentPrice))
    .slice(0, 10)
)}
    `;

    let chatHistory = [
      {
        role: "system",
        content: preamble,
      },
    ];

    const chatClient = new OpenAIChatClient(apiKey);
    const firstResponse = JSON.parse(await chatClient.chat(chatHistory));
    // const firstResponse = chatHistory;

    // console.log("FIRST RESPONSE FROM API:", firstResponse);

    chatHistory.push({
      role: "assistant",
      content: JSON.stringify(firstResponse),
    });
    chatHistory.push({
      role: "user",
      content: `Now we will price the ingredients in this recipe. 
      At the end of this prompt I will show you a list of available ingredients and their prices and you will find a price for each ingredient in the recipe.
      Only price ingredients that fall into the following categories: meats and seafood, fruits and vegetables, and carbohydrates and starches.
      If an ingredient can't be found in the list, try to replace it with a similar ingredient from the list.
      If there are no similar ingredients, then just leave the original ingredient in the recipe.
      
      Output the recipe the same as before, but with the prices of each ingredient listed next to it. 
      If the ingredient is on sale, indicate that by showing the current price and the regular price.

      Here is the list of available ingredients and their prices:
        
        ${JSON.stringify([
          // ...meatAndSeafood
          //   .filter((item) => item.onSale)
          //   .map((item) => ({
          //     item: item.title,
          //     currentPrice: item.currentPrice,
          //     regularPrice: item.regularPrice,
          //   })),
          ...fruitAndVeg
            .filter((item) => item.onSale)
            .map((item) => ({
              item: item.title,
              currentPrice: item.currentPrice,
              regularPrice: item.regularPrice,
            })),
          // ...dairyAndEggs.map((item) => ({
          //   item: item.title,
          //   currentPrice: item.currentPrice,
          //   regularPrice: item.regularPrice,
          // })),
          // ...cheese.map((item) => ({
          //   item: item.title,
          //   currentPrice: item.currentPrice,
          //   regularPrice: item.regularPrice,
          // })),
        ])}
        `,
    });
    let secondResponse = JSON.parse(await chatClient.chat(chatHistory));
    secondResponse = {
      ...secondResponse,
      costPerServing:
        secondResponse.ingredients.priced.reduce(
          (acc, item) => acc + item.fromStore.perRecipeCost,
          0
        ) / secondResponse.serves,
      regularPriceCostPerServing:
        secondResponse.ingredients.priced.reduce(
          (acc, item) => acc + item.fromStore.regularPrice,
          0
        ) / secondResponse.serves,
      totalCost: secondResponse.ingredients.priced.reduce(
        (acc, item) => acc + item.fromStore.perRecipeCost,
        0
      ),
      regularPriceTotalCost: secondResponse.ingredients.priced.reduce(
        (acc, item) => acc + item.fromStore.regularPrice,
        0
      ),
      discount: secondResponse.ingredients.priced.reduce(
        (acc, item) => acc + item.fromStore.regularPrice - item.fromStore.currentPrice,
        0
      ),
      chatHistory,
    };

    console.log("SECOND RESPONSE FROM API:", secondResponse);

    res.status(200).json(secondResponse);
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
