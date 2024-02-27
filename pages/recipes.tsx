import React, { useState } from "react";
import TopBar from "../components/TopBar";
import MealPlanSection from "../components/MealPlanSection";
import { AppStateProvider } from "../components/AppStateContext";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import { Recipe, DietaryRestrictions } from "@/utils/generateRecipe";
import ShoppingListSection from "@/components/ShoppingListSection";

export const getStaticProps: GetStaticProps = async () => {
  const recipes = await prisma.recipe.findMany();
  return {
    props: { recipes },
    revalidate: 10,
  };
};

type Props = {
  recipes: Recipe[];
};

const HomePage: React.FC<Props> = ({ recipes }) => {
  const [activeRestrictions, setActiveRestrictions] = useState<Set<DietaryRestrictions>>(new Set());

  const toggleRestriction = (restriction: DietaryRestrictions) => {
    setActiveRestrictions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(restriction)) {
        newSet.delete(restriction);
      } else {
        newSet.add(restriction);
      }
      return newSet;
    });
  };

  const filteredRecipes = recipes.filter((recipe) =>
    activeRestrictions.size === 0
      ? true
      : Array.from(activeRestrictions).every((restriction) =>
          recipe.dietaryRestrictions.includes(restriction)
        )
  );

  return (
    <AppStateProvider>
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex flex-row flex-grow overflow-hidden">
          <div className="flex flex-col w-full h-full overflow-y-auto">
            <div className="px-4 pt-8 md:px-8 lg:px-16">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <div className="flex gap-2 flex-wrap">
                {Object.values(DietaryRestrictions).map((restriction) => (
                  <button
                    key={restriction}
                    onClick={() => toggleRestriction(restriction)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold cursor-pointer transition-colors duration-150 ease-in-out ${
                      activeRestrictions.has(restriction)
                        ? "bg-green-500 text-white"
                        : "bg-green-200 hover:bg-green-300"
                    }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
            </div>
            <MealPlanSection recipes={filteredRecipes} />
          </div>
        </div>
      </div>
    </AppStateProvider>
  );
};

export default HomePage;
