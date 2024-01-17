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
import { fetchSearchResults } from "../search";

export const generateRecipeIdeaPreamble = async (
  proteinsOnSale: Ingredient[],
  cuisine?: string,
  dietaryRestrictions?: string[],
  ingredients?: Ingredient[]
) => `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
  The way you will do this is by choosing a protein source from the sale data and generating a realistic recipe using it.
  Recipes should be healthy, balanced meals.
  Your recipes are delicious, diverse, healthy, and draw from multiple cultures and cuisines.
  ${cuisine ? `Your recipe must be ${cuisine}.` : "Make recipes from all over the world."}
  ${dietaryRestrictions ? `Your recipe must be ${dietaryRestrictions.join(", ")}.` : ""}

  Return recipes in JSON following this example:
  {
    protein: "Chicken Leg Quarters Value Size 3-5 Pieces",
    ${cuisine ? "" : `cuisine: "Mexican",`}
    title: "Sweet Potato and Chicken Hash",
    description: "A cozy, hearty meal to warm you on those cold winter nights. lots of protein and veggies to keep you full and healthy."
    serves: 4,
  }
 
Protein on Sale:
${proteinsOnSale
  .filter((item, index, array) => array.findIndex((i) => i.title === item.title) === index) // Remove duplicates
  .sort((a, b) => b.regularPrice - b.currentPrice - (a.regularPrice - a.currentPrice))
  .slice(0, 10)
  .map((item) => item.title)
  .join("\n")}
`;

export const generateRecipeIngredientsPreamble = async (recipeIdea: {
  title: string;
  protein: string;
  description: string;
  serves: number;
}) => `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
given the following recipe idea, choose the ingredients and return them following this example JSON:
{
  ingredients: {
    priced: [
      {title: "sweet potatoes", amount: 0.2, units: "kg"},
      {"title": "chicken breasts", "amount": 4, "units": "items"},
      {"title": "red onion", "amount": 1, "units": "item"},
      {"title": "zucchini", "amount": 1, "units": "item"},
      {"title": "head of broccoli", "amount": 1, "units": "item"},
      {"title": "cooked brown rice", "amount": 0.5, "units": "cup"},
    ],
    unpriced: [
      {title: "olive oil", amount: 1, units: "tablespoon"},
      {title: "salt", amount: 1, units: "teaspoon"},
      {title: "black pepper", amount: 1, units: "teaspoon"}
    ]
  },
}

  Unpriced ingredients should be common pantry items like cooking oils, vinegars, sauces like Soy sauce, Worcestershire sauce, Hot sauce, condiments like  Mustard, Ketchup, Mayonnaise, spices and dried herbs like cinnamon, cumin, dried rosemary, etc.
  Unpriced ingredients should not include things like fresh herbs.
  Keep the ingredients as generic as possible except in cases where it's an important destinction. For exmaple, use "bread crumbs" instead of "whole grain bread crumbs", but use "fresh basil" or "dry basil" instead of "basil".

  Recipe:
  ${recipeIdea.title}
  ${recipeIdea.description}
  Serves: ${recipeIdea.serves}
`;

export const generateRecipeInstructionsPreamble = async (recipeIdea: {
  title: string;
  protein: string;
  description: string;
  serves: number;
  ingredients: any;
}) => `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
given the following recipe, come up with the instructions and return them following this example JSON:
{
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
  prepTime: 15,
  cookTime: 30,
}

  Recipe:
  ${recipeIdea.title}
  ${recipeIdea.description}
  Serves: ${recipeIdea.serves}
  Ingredients: ${recipeIdea.ingredients.priced
    .map((item: any) => item.title)
    .join(", ")}, ${recipeIdea.ingredients.unpriced.map((item: any) => item.title).join(", ")}
`;
