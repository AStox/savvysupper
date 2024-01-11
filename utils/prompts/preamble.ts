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

export const generatePreamble =
  async () => `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes.
  The way you will do this is by choosing a protein source from the sale data a generating a realistic recipe using that protein.
  Recipes should include a protein, a starch, and a vegetable.
  Your recipes are delicious, diverse, healthy, and draw from multiple cultures and cuisines.
  Make recipes from all over the world.
  Return recipes in JSON following this example:

SAMPLE OF SALE DATA:
{
  protein: "Chicken Leg Quarters Value Size 3-5 Pieces",
  cuisine: "Mexican",
  title: "Sweet Potato and Chicken Hash",
  description: "A cozy, hearty meal to warm you on those cold winter nights. lots of protein and veggies to keep you full and healthy."
  serves: 4,
  prepTime: 15,
  cookTime: 30,
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
${[
  ...(await fetchSearchResults("Beef", 10, true)),
  ...(await fetchSearchResults("Veal", 10, true)),
  ...(await fetchSearchResults("Chicken", 10, true)),
  ...(await fetchSearchResults("Pork", 10, true)),
  ...(await fetchSearchResults("Turkey", 10, true)),
  ...(await fetchSearchResults("Lamb", 10, true)),
  ...(await fetchSearchResults("Fish", 10, true)),
  ...(await fetchSearchResults("Seafood", 10, true)),
  ...(await fetchSearchResults("Bacon", 10, true)),
  ...(await fetchSearchResults("Sausages", 10, true)),
]
  .filter((item, index, array) => array.findIndex((i) => i.title === item.title) === index) // Remove duplicates
  .sort((a, b) => b.regularPrice - b.currentPrice - (a.regularPrice - a.currentPrice))
  .slice(0, 10)
  .map((item) => item.title)
  .join("\n")}
`;
// ${JSON.stringify(
//   [
//     ...BeefAndVeal,
//     ...Chicken,
//     ...Pork,
//     ...Turkey,
//     ...Lamb,
//     ...Fish,
//     ...ExoticMeats,
//     ...FishAndSeafood,
//     ...Bacon,
//     ...HotDogsAndSausages,
//   ]
//     .filter((item) => item.onSale)
//     .sort((a, b) => b.regularPrice - b.currentPrice - (a.regularPrice - a.currentPrice))
//     .slice(0, 10)
//     .map((item) => ({
//       title: item.title,
//       discount: item.regularPrice - item.currentPrice,
//     }))
// )}
// `;
