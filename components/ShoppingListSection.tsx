import React, { useState } from "react";
import { useAppState } from "./AppStateContext";
import styles from "./ShoppingListSection.module.css"; // Import the CSS module
import { Recipe } from "@/utils/generateRecipe";

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

const ShoppingListSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"shoppingList" | "leftovers">("shoppingList");
  const { meals } = useAppState();
  calculateLeftovers(meals);
  console.log("MEALS WITH LEFTOVERS:", meals);

  return (
    <div
      className={`flex-none transition-width duration-300 overflow-hidden bg-white shadow-xl z-10 ${
        isOpen ? "w-96" : "w-0"
      } ${styles.shoppingList}`}
    >
      <button
        className="absolute top-1/2 left-[-40px] w-10 h-10 bg-blue-500 text-white transform -translate-y-1/2 rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "<" : ">"}
      </button>
      <div className={`p-4 ${isOpen ? "block" : "hidden"}`}>
        <button
          className={`flex-1 py-2 ${
            activeTab === "shoppingList" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("shoppingList")}
        >
          Shopping List
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === "leftovers" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("leftovers")}
        >
          Leftovers
        </button>
        {activeTab === "shoppingList" && (
          <>
            {meals.map((meal, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{meal.title}</h3>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="border-b font-medium text-gray-700 px-4 py-2 text-left">
                        Ingredient
                      </th>
                      <th className="border-b font-medium text-gray-700 px-4 py-2 text-left">
                        Quantity
                      </th>
                      <th className="border-b font-medium text-gray-700 px-4 py-2 text-left">
                        Price
                      </th>
                      <th className="border-b font-medium text-gray-700 px-4 py-2 text-left">
                        To Buy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.shoppingList.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td className="border-b border-gray-300 px-4 py-2 text-gray-700">
                          {item.ingredient.title}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 text-gray-700">
                          {item.ingredient.quantity}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 text-gray-700">
                          {item.ingredient.currentPrice}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 text-gray-700">
                          {item.amountToBuy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
        {activeTab === "leftovers" && (
          <>
            {meals.map((meal, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{meal.title}</h3>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="border-b font-medium text-gray-700 px-4 py-2 text-left">
                        Ingredient
                      </th>
                      <th className="border-b font-medium text-gray-700 px-4 py-2 text-left">
                        Amount Leftover
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.leftovers.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td className="border-b border-gray-300 px-4 py-2 text-gray-700">
                          {item.title}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2 text-gray-700">
                          {item.amountLeftOver} {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

function calculateLeftovers(meals: Recipe[]) {
  for (let i = 0; i < meals.length; i++) {
    meals[i].leftovers = [];
    const storeIngredients = meals[i].shoppingList.map((item) => item.ingredient.title);
    for (let j = 0; j < meals[i].shoppingList.length; j++) {
      const item = meals[i].shoppingList[j];
      console.log("ITEM:", item);
      const { amount, unit } = convertMeasurement(item.ingredient.quantity);
      console.log("AMOUNT:", amount);
      console.log("UNIT:", unit);
      const amountBought = item.amountToBuy * amount;

      console.log(meals[i].ingredients[j]);
      const { amount: recipeAmount } = convertMeasurement(
        `${meals[i].ingredients[j].amount}${meals[i].ingredients[j].unit}`
      );
      const amountLeftOver = amountBought - recipeAmount;
      console.log("AMOUNT LEFT OVER:", amountLeftOver);
      if (amountLeftOver > 0) {
        const leftoverIngredient = {
          title: item.ingredient.title,
          amountLeftOver,
          unit: unit,
          currentPrice: item.ingredient.currentPrice,
        };
        meals[i].leftovers.push(leftoverIngredient);
      }
    }
  }
}

type Unit = "kg" | "lbs" | "L";
type UnitsToIgnore = "tsp" | "tbsp" | "cup" | "oz" | "ml" | "g" | "ea";
type AllUnits = Unit | UnitsToIgnore;

function convertMeasurement(input: string): { amount: number; unit: string } {
  const unitMap: { [key in Unit]: number } = {
    kg: 1000, // 1 kg = 1000 grams
    lbs: 16, // 1 lb = 16 ounces
    L: 1000, // 1 L = 1000 milliliters
  };
  const convertedUnit: { [key in Unit]: string } = {
    kg: "g",
    lbs: "oz",
    L: "ml",
  };

  // Updated regular expression to match the number and unit, allowing for a space
  const regex = /([\d.]+)\s*([a-zA-Z]+)/;
  const matches = input.match(regex);

  if (matches && matches.length === 3) {
    const value = parseFloat(matches[1]);
    const unit = matches[2] as AllUnits;

    if (unit in unitMap) {
      // Unit is one of the convertible types
      return { amount: value * unitMap[unit as Unit], unit: convertedUnit[unit as Unit] };
    } else {
      // Unit is one of the non-convertible types (or unrecognized)
      return { amount: value, unit: unit };
    }
  } else {
    console.log(input);
    throw new Error("Invalid input format");
  }
}

export default ShoppingListSection;
