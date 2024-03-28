import React from "react";
import Image from "next/image";
import { Recipe, Ingredient as RecipeIngredient } from "@/utils/generateRecipe";
import { Ingredient } from "@/prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface RecipeModalProps {
  meal: Recipe;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ meal, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto w-4/5 md:w-3/4 lg:w-3/4 shadow-lg rounded-md bg-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <div className="relative w-full h-96">
            <Image src={meal.image} alt={meal.title} layout="fill" objectFit="cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
            <h2 className="absolute bottom-4 left-4 text-3xl font-bold text-white">{meal.title}</h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 transition duration-200"
            >
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="text-left w-full p-8">
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <p className="text-lg italic text-gray-600">{meal.description}</p>
            </div>
            <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
            <ul className="space-y-4">
              {meal.ingredients.map((recipeIngredient, index) => {
                const shoppingListIngredient = meal.shoppingList.find(
                  (item) => item.recipeIngredientTitle === recipeIngredient.title
                );
                return (
                  <li key={index} className="flex items-center justify-between">
                    <span className="w-48 truncate">{recipeIngredient.title}</span>
                    {shoppingListIngredient && (
                      <div className="flex items-center bg-gray-100 p-3 rounded ml-4 w-3/4">
                        <div className="flex items-center gap-3 flex-1 truncate">
                          {shoppingListIngredient.ingredient.image && (
                            <Image
                              src={shoppingListIngredient.ingredient.image}
                              alt={shoppingListIngredient.ingredient.title}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          )}
                          <span className="font-semibold flex-1 truncate">
                            {shoppingListIngredient.ingredient.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            ({shoppingListIngredient.ingredient.amount}{" "}
                            {shoppingListIngredient.ingredient.units})
                          </span>
                          <span className="font-semibold">
                            x{shoppingListIngredient.amountToBuy}
                          </span>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                shoppingListIngredient.ingredient.onSale ? "text-green-600" : ""
                              }`}
                            >
                              ${shoppingListIngredient.ingredient.currentPrice}
                            </span>

                            {shoppingListIngredient.ingredient.discount > 0 && (
                              <>
                                <span className="text-gray-500 line-through">
                                  ${shoppingListIngredient.ingredient.regularPrice}
                                </span>
                                <span className="text-green-600">
                                  (
                                  {(
                                    (shoppingListIngredient.ingredient.discount /
                                      shoppingListIngredient.ingredient.regularPrice) *
                                    100
                                  ).toFixed(0)}
                                  % off)
                                </span>
                              </>
                            )}
                            <span className="text-sm">
                              ($
                              {Number(shoppingListIngredient.ingredient.perUnitPrice).toFixed(2)}/
                              {shoppingListIngredient.ingredient.units})
                            </span>
                          </div>
                          <div className="text-sm truncate">
                            ({shoppingListIngredient.amountLeftover} {shoppingListIngredient.units}{" "}
                            leftover)
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <h3 className="text-xl font-semibold mt-8 mb-4">Instructions</h3>
            <ol className="space-y-4 list-decimal pl-5">
              {meal.instructions.map((instruction, index) => (
                <li key={index} className="text-lg">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
