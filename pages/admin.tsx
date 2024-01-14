import React, { useState } from "react";
import styles from "./admin.module.css";
import { generateRecipe } from "@/utils/meal";
import { fetchSearchResults } from "@/utils/search";
import { generateImage } from "@/utils/image";
import { downloadAndSaveImage } from "@/utils/downloadAndSaveImage";
import { deleteRecipe } from "@/utils/deleteRecipe";

const AdminPage = () => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [onSale, setOnSale] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [recipe, setRecipe] = useState("");

  const createCollection = async () => {
    setLoading(true);
    setResponse("");
    const response = await fetch("/api/createCollection", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const dropCollection = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const response = await fetch("/api/dropCollection", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const insertCollection = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const response = await fetch("/api/insertCollection", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const ingredientScraper = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const response = await fetch("/api/ingredientScraper", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const vectorize = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const response = await fetch("/api/vectorize", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const searchCollection = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const data = await fetchSearchResults(searchQuery, limit, onSale);
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const genImage = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const response = await generateImage(imagePrompt);
    const data = await response;
    setImageSrc(data.url);
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const genRecipe = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const recipe = await generateRecipe((status, progress) =>
      setResponse(status + " " + progress * 100 + "%")
    );
    setImageSrc(recipe.image);
    setResponse(JSON.stringify(recipe, null, 2));
    setLoading(false);
  };

  const testDownloadAndSaveImage = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const response = await downloadAndSaveImage(
      "https://images.unsplash.com/photo-1682686581413-0a0ec9bb35bb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "test.jpg"
    );
    const data = await response;
    setResponse(JSON.stringify(data, null, 2));
    setImageSrc(data);
    setLoading(false);
  };

  const testDeleteRecipe = async () => {
    setLoading(true);
    setResponse("");
    setImageSrc("");
    const response = deleteRecipe(recipe);
    const data = await response;
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  return (
    <div className={styles.adminContainer}>
      <button className={styles.button} onClick={createCollection} disabled={loading}>
        Create Collection
      </button>
      <button className={styles.button} onClick={dropCollection} disabled={loading}>
        Drop Collection
      </button>
      <button className={styles.button} onClick={ingredientScraper} disabled={loading}>
        Ingredient Scraper
      </button>
      <button className={styles.button} onClick={vectorize} disabled={loading}>
        Vectorize
      </button>
      <button className={styles.button} onClick={insertCollection} disabled={loading}>
        Insert Vectors Into Collection
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
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Enter image prompt"
          disabled={loading}
        />
        <button className={styles.searchButton} onClick={genImage} disabled={loading}>
          Generate Image
        </button>
      </div>
      <button className={styles.button} onClick={testDownloadAndSaveImage} disabled={loading}>
        Test Download and Save Image
      </button>
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
      <button className={styles.button} onClick={genRecipe} disabled={loading}>
        Generate Recipe
      </button>
      {loading && <p className={styles.loading}>Loading...</p>}
      {imageSrc && <img src={imageSrc} alt="Generated" className={styles.generatedImage} />}
      <pre className={styles.responseBox}>{response}</pre>
    </div>
  );
};

export default AdminPage;
