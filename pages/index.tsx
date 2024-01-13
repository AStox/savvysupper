import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import MealPlan from "../components/MealPlan";
import { Meal } from "../components/MealCard"; // Import the Meal interface
import SecondaryTopBar from "../components/SecondaryTopBar";
import { AppStateProvider, useAppState } from "../components/AppStateContext";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import { Recipe } from "@/utils/meal";

export const getStaticProps: GetStaticProps = async () => {
  const recipes = await prisma.recipe.findMany();
  return {
    props: { recipes: recipes },
    revalidate: 10,
  };
};

type Props = {
  recipes: Recipe[];
};

const Home: React.FC<Props> = (props) => {
  // const { meals } = useAppState();

  // const totalCost = mockMeals.reduce((acc, meal) => acc + meal.cost, 0); // Example calculation
  // const totalSavings = mockMeals.reduce((acc, meal) => acc + meal.savings, 0); // Example calculation
  console.log(props.recipes);
  return (
    <AppStateProvider>
      <div>
        <TopBar />
        <SecondaryTopBar />
        <MealPlan recipes={props.recipes} />
      </div>
    </AppStateProvider>
  );
};

export default Home;
