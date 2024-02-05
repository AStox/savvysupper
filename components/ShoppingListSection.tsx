import React, { useState } from "react";
import { useAppState } from "./AppStateContext";
import styles from "./ShoppingListSection.module.css";
import { Recipe } from "@/utils/generateRecipe";
import { Ingredient } from "@/pages/api/ingredientScraper";
import { generateLeftoversPreamble } from "@/utils/prompts/preamble";
import { fetchChatResponse } from "@/utils/chat";
import { convertMeasurement } from "@/utils/convertMeasurement";

// interface ShoppingList {
//     [
//         ingredient: {
//         title: string;
//         quantity: number;
//         currentPrice: number;
//     };
//     amountToBuy: number;
// ]
// }

enum Tab {
  ShoppingList,
  // Leftovers,
  Ingredients,
}

type RecipeWithLeftovers = Recipe & { leftovers: any[] };

const ShoppingListSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Ingredients);
  const { meals } = useAppState();
  const [mealsWithLeftovers, setMealsWithLeftovers] = useState<RecipeWithLeftovers[]>([]);

  // useEffect(() => {
  // const fetchAllLeftovers = async () => {
  //   const updatedMeals = await Promise.all(
  //     meals.map(async (meal) => {
  //       const leftovers = await fetchLeftovers(meal);
  //       return { ...meal, leftovers };
  //     })
  //   );
  //   setMealsWithLeftovers(updatedMeals);
  // };

  // fetchAllLeftovers();
  // console.log("mealsWithLeftovers", mealsWithLeftovers);
  // }, [meals]);

  return (
    <div
      className={`flex-none transition-width duration-300 overflow-hidden z-10 ${
        isOpen ? "w-96" : "w-0"
      } ${styles.shoppingList}`}
    >
      <button
        className="absolute top-1/2 left-[-40px] w-10 h-10 bg-blue-500 transform -translate-y-1/2 rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "<" : ">"}
      </button>
      <div className={`p-4 ${isOpen ? "block" : "hidden"}`}>
        <button
          className={`flex-1 py-2 ${
            activeTab === Tab.Ingredients ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab(Tab.Ingredients)}
        >
          Ingredients
        </button>
        <button
          className={`flex-1 py-2 ${
            activeTab === Tab.ShoppingList ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab(Tab.ShoppingList)}
        >
          Shopping List
        </button>
        {/* <button
          className={`flex-1 py-2 ${
            activeTab === Tab.Leftovers ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab(Tab.Leftovers)}
        >
          Leftovers
        </button> */}
        {activeTab === Tab.Ingredients && (
          <>
            {meals.map((meal, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold ">{meal.title}</h3>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="border-b font-medium  px-4 py-2 text-left">Ingredient</th>
                      <th className="border-b font-medium  px-4 py-2 text-left">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.ingredients.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td className="border-b border-gray-300 px-4 py-2 ">{item.title}</td>
                        <td className="border-b border-gray-300 px-4 py-2 ">
                          {item.amount} {item.units}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
        {activeTab === Tab.ShoppingList && (
          <>
            {meals.map((meal, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold ">{meal.title}</h3>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="border-b font-medium  px-4 py-2 text-left">Ingredient</th>
                      <th className="border-b font-medium  px-4 py-2 text-left">Quantity</th>
                      <th className="border-b font-medium  px-4 py-2 text-left">Price</th>
                      <th className="border-b font-medium  px-4 py-2 text-left">To Buy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.shoppingList.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td className="border-b border-gray-300 px-4 py-2 ">
                          {item.ingredient.title}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 ">
                          {item.ingredient.amount} {item.ingredient.units}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 ">
                          {item.ingredient.currentPrice}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 ">{item.amountToBuy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
        {/* {activeTab === Tab.Leftovers && (
          <>
            {meals.map((meal, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold ">{meal.title}</h3>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="border-b font-medium  px-4 py-2 text-left">
                        Ingredient
                      </th>
                      <th className="border-b font-medium  px-4 py-2 text-left">
                        Leftover
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.shoppingList.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td className="border-b border-gray-300 px-4 py-2 ">
                          {item.ingredient.title}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 ">
                          {item.amountLeftover} {item.units}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )} */}
      </div>
    </div>
  );
};

// async function fetchLeftovers(meal: Recipe): Promise<any[]> {
//   const preamble = await generateLeftoversPreamble(meal);
//   let chatHistory = [
//     {
//       role: "user",
//       content: preamble,
//     },
//   ];
//   const response = JSON.parse(await fetchChatResponse(chatHistory));
//   return response.leftovers as any[];
// }

// function calculateLeftovers(meal: Recipe): any[] {
//   let leftovers: any[] = [];
//   console.log("---------------------MEAL:", meal.title, "---------------------");
//   // meals[i].leftovers = [];
//   const storeIngredients = meal.shoppingList.map((item) => item.ingredient.title);
//   for (let j = 0; j < meal.shoppingList.length; j++) {
//     console.log("-", meal.shoppingList[j].ingredient.title, "-");
//     const item = meal.shoppingList[j];
//     const amountBought = item.amountToBuy * item.ingredient.amount;

//     console.log(meal.ingredients[j]);
//     const recipeIngredient = meal.ingredients.find(
//       (ingredient) => ingredient.title === item.recipeIngredientTitle
//     );
//     console.log("RECIPE INGREDIENT:", recipeIngredient?.title);
//     const { amount: recipeAmount } = convertMeasurement(
//       `${recipeIngredient?.amount}${recipeIngredient?.units}`
//     );
//     const amountLeftOver = amountBought - recipeAmount;
//     console.log("AMOUNT LEFT OVER:", amountLeftOver);
//     if (amountLeftOver > 0) {
//       const leftoverIngredient = {
//         title: item.ingredient.title,
//         amountLeftOver,
//         units: units,
//         currentPrice: item.ingredient.currentPrice,
//       };
//       leftovers.push(leftoverIngredient);
//     }
//   }
//   return leftovers;
// }

export default ShoppingListSection;
