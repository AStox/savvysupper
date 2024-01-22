import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import TopBar from "../components/TopBar";
import MealPlanSection from "../components/MealPlanSection";
import SecondaryTopBar from "../components/SecondaryTopBar";
import { AppStateProvider, useAppState } from "../components/AppStateContext";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import { Recipe } from "@/utils/generateRecipe";
import ShoppingListSection from "@/components/ShoppingListSection";

// export const getStaticProps: GetStaticProps = async () => {
//   const recipes = await prisma.recipe.findMany();
//   return {
//     props: { recipes: recipes },
//     revalidate: 10,
//   };
// };

// type Props = {
//   recipes: Recipe[];
// };

const Home: React.FC = () => {
  return (
    <AppStateProvider>
      <div className="flex flex-col h-screen">
        <TopBar />
        <SecondaryTopBar />
        <div className="flex flex-row flex-grow overflow-hidden">
          <MealPlanSection />
          <ShoppingListSection />
        </div>
      </div>
    </AppStateProvider>
  );
};

export default Home;
