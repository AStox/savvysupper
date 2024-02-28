import React, { useState } from "react";
import styles from "./admin.module.css";
import { DietaryRestrictions, generateRecipe, generateRecipePreview } from "@/utils/generateRecipe";
import { fetchSearchResults } from "@/utils/search";
import { generateImage } from "@/utils/image";
import { downloadAndSaveImage } from "@/utils/downloadAndSaveImage";
import { deleteRecipe } from "@/utils/deleteRecipe";

const AdminPage = () => {
  const [response, setResponse] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [progress, setProgress] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [onSale, setOnSale] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [recipe, setRecipe] = useState("");
  const [numberOfRecipes, setNumberOfRecipes] = useState(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestrictions[]>([]);

  const ingredientScraper = async () => {
    setLoading(true);
    setNumberOfRecipes(1);
    setProgress("");
    setResponse("");
    setImageSrc("");
    const response = await fetch("/api/ingredientScraper", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const vectorize = async () => {
    setLoading(true);
    setNumberOfRecipes(1);
    setProgress("");
    setResponse("");
    setImageSrc("");
    const response = await fetch("/api/vectorize", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const searchCollection = async () => {
    setLoading(true);
    setNumberOfRecipes(1);
    setProgress("");
    setResponse("");
    setImageSrc("");
    const data = await fetchSearchResults(searchQuery, limit, onSale);
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const genRecipes = async () => {
    setLoading(true);
    setProgress("");
    setResponse("");
    setImageSrc("");

    const promises = [];
    for (let i = 0; i < numberOfRecipes; i++) {
      promises.push(
        generateRecipe(dietaryRestrictions, (status, progress) =>
          setResponse(status + " " + progress * 100 + "%")
        )
      );
    }

    const recipes = await Promise.all(promises);
    recipes.forEach((recipe) => {
      setImageSrc(recipe.image);
      setResponse(JSON.stringify(recipe, null, 2));
    });

    setLoading(false);
  };

  const testDeleteRecipe = async () => {
    setLoading(true);
    setNumberOfRecipes(1);
    setProgress("");
    setResponse("");
    setImageSrc("");
    const response = deleteRecipe(recipe);
    const data = await response;
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const toggleDietaryRestriction = (restriction: DietaryRestrictions) => {
    if (dietaryRestrictions.includes(restriction)) {
      setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== restriction));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, restriction]);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <button className={styles.button} onClick={ingredientScraper} disabled={loading}>
        Ingredient Scraper
      </button>
      <button className={styles.button} onClick={vectorize} disabled={loading}>
        Vectorize
      </button>
      <div className={styles.searchGroup}>
        <input
          type="text"
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter search query"
          disabled={loading}
        />
        <input
          type="number"
          className={styles.searchLimit}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          min="1"
          placeholder="Limit"
          disabled={loading}
        />
        <label className={styles.onSaleCheckbox}>
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            disabled={loading}
          />
          On Sale
        </label>
        <button className={styles.searchButton} onClick={searchCollection} disabled={loading}>
          Search
        </button>
      </div>
      <div className={styles.searchGroup}>
        <input
          type="text"
          className={styles.searchInput}
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
          placeholder="Enter recipe name or 'all' to delete all recipes"
          disabled={loading}
        />
        <button className={styles.searchButton} onClick={testDeleteRecipe} disabled={loading}>
          Delete Recipe
        </button>
      </div>
      <div className={styles.searchGroup}>
        <input
          type="number"
          className={styles.searchLimit}
          value={numberOfRecipes}
          onChange={(e) => setNumberOfRecipes(Number(e.target.value))}
          min="1"
          placeholder="Number of recipes to generate"
          disabled={loading}
        />
        {Object.values(DietaryRestrictions).map((restriction) => (
          <button
            key={restriction}
            className={`${styles.dietaryRestrictionButton} ${
              dietaryRestrictions.includes(restriction) ? styles.active : ""
            }`}
            onClick={() => toggleDietaryRestriction(restriction)}
            disabled={loading}
          >
            {restriction}
          </button>
        ))}

        <button className={styles.generateRecipeButton} onClick={genRecipes} disabled={loading}>
          Generate Recipe
        </button>
      </div>
      {loading && <p className={styles.loading}>Loading...</p>}
      {progress && <p className={styles.loading}>{progress}</p>}
      {imageSrc && <img src={imageSrc} alt="Generated" className={styles.generatedImage} />}
      <pre className={styles.responseBox}>{response}</pre>
    </div>
  );
};

export default AdminPage;
