import React, { useState } from "react";
import { useAppState } from "./AppStateContext";
import styles from "./ShoppingListSection.module.css";
import { Recipe } from "@/utils/generateRecipe";

enum Tab {
  ShoppingList,
  Ingredients,
}

type RecipeWithLeftovers = Recipe & { leftovers: any[] };

const ShoppingListSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Ingredients);
  const { meals } = useAppState();

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
          className={`flex-1 mx-5 px-2 py-2 ${
            activeTab === Tab.ShoppingList ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab(Tab.ShoppingList)}
        >
          Shopping List
        </button>
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
                    {meal.shoppingList?.map((item, itemIndex) => (
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
      </div>
    </div>
  );
};

export default ShoppingListSection;
