import { Recipe } from "@/utils/generateRecipe";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { PlanMeals } from "@/utils/planMeals";

const AppStateContext = createContext<{
  meals: Recipe[];
  setMeals: React.Dispatch<React.SetStateAction<Recipe[]>>;
  numberOfMeals: number;
  setNumberOfMeals: React.Dispatch<React.SetStateAction<number>>;
  generating: boolean;
  setGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  meals: [],
  setMeals: () => {},
  numberOfMeals: 1,
  setNumberOfMeals: () => {},
  generating: false,
  setGenerating: () => {},
});

export const useAppState = () => useContext(AppStateContext);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [meals, setMeals] = useState([] as Recipe[]);
  const [numberOfMeals, setNumberOfMeals] = useState(1);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    console.log("Meals updated:", meals);
  }, [meals]);

  return (
    <AppStateContext.Provider
      value={{
        meals,
        setMeals,
        numberOfMeals,
        setNumberOfMeals,
        generating,
        setGenerating,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
