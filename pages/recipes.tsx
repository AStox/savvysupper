import React, { useState } from "react";
import TopBar from "../components/TopBar";
import MealPlanSection from "../components/MealPlanSection";
import { AppStateProvider } from "../components/AppStateContext";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import { Recipe, DietaryRestrictions } from "@/utils/generateRecipe";
import ShoppingListSection from "@/components/ShoppingListSection";

export const getStaticProps: GetStaticProps = async () => {
  const recipes = await prisma.recipe.findMany({
    include: {
      shoppingList: {
        include: {
          ingredient: {
            select: {
              id: true,
              title: true,
              amount: true,
              units: true,
              categories: true,
              currentPrice: true,
              regularPrice: true,
              perUnitPrice: true,
              discount: true,
              onSale: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return {
    props: { recipes: recipes },
    revalidate: 10,
  };
};

type Props = {
  recipes: Recipe[];
};

const HomePage: React.FC<Props> = ({ recipes }) => {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  console.log(recipes);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filter)) {
        newSet.delete(filter);
      } else {
        newSet.add(filter);
      }
      return newSet;
    });
  };

  const filteredRecipes = recipes.filter((recipe) =>
    activeFilters.size === 0
      ? true
      : Array.from(activeFilters).every(
          (filter) => recipe.cuisine === filter || recipe.dietaryRestrictions.includes(filter)
        )
  );

  // Calculate cuisine and dietary restriction counts
  const cuisineCounts: { [cuisine: string]: number } = {};
  const dietaryRestrictionCounts: { [restriction: string]: number } = {};
  recipes.forEach((recipe) => {
    const cuisine = recipe.cuisine;
    cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;

    recipe.dietaryRestrictions.forEach((restriction) => {
      dietaryRestrictionCounts[restriction] = (dietaryRestrictionCounts[restriction] || 0) + 1;
    });
  });

  // Sort cuisine and dietary restriction counts in descending order
  const sortedCuisineCounts = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1]);
  const sortedDietaryRestrictionCounts = Object.entries(dietaryRestrictionCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <AppStateProvider>
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex flex-row flex-grow overflow-hidden">
          <div className="flex flex-col w-full h-full overflow-y-auto">
            <div className="px-4 pt-8 md:px-8 lg:px-16">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex gap-2 flex-wrap">
                  {sortedCuisineCounts.map(([cuisine, count]) => (
                    <button
                      key={cuisine}
                      onClick={() => toggleFilter(cuisine)}
                      className={`rounded-full px-3 py-1 text-sm font-semibold cursor-pointer transition-colors duration-150 ease-in-out ${
                        activeFilters.has(cuisine)
                          ? "bg-green-500 text-white"
                          : "bg-green-200 hover:bg-green-300"
                      }`}
                    >
                      {cuisine}: {count}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sortedDietaryRestrictionCounts.map(([restriction, count]) => (
                    <button
                      key={restriction}
                      onClick={() => toggleFilter(restriction)}
                      className={`rounded-full px-3 py-1 text-sm font-semibold cursor-pointer transition-colors duration-150 ease-in-out ${
                        activeFilters.has(restriction)
                          ? "bg-green-500 text-white"
                          : "bg-green-200 hover:bg-green-300"
                      }`}
                    >
                      {restriction}: {count}
                    </button>
                  ))}
                </div>
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
