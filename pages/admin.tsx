import React, { useState } from "react";
import styles from "./admin.module.css";
import { generateRecipe } from "@/utils/meal";
import { fetchSearchResults } from "@/utils/search";

const AdminPage = () => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [onSale, setOnSale] = useState(false);

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
    const response = await fetch("/api/dropCollection", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const insertCollection = async () => {
    setLoading(true);
    setResponse("");
    const response = await fetch("/api/insertCollection", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const ingredientScraper = async () => {
    setLoading(true);
    setResponse("");
    const response = await fetch("/api/ingredientScraper", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const vectorize = async () => {
    setLoading(true);
    setResponse("");
    const response = await fetch("/api/vectorize", { method: "POST" });
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const searchCollection = async () => {
    setLoading(true);
    setResponse("");
    const data = await fetchSearchResults(searchQuery, limit, onSale);
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  const genRecipe = async () => {
    setLoading(true);
    setResponse("");
    const recipe = JSON.stringify(await generateRecipe());
    setResponse(recipe);
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
      <button className={styles.button} onClick={genRecipe} disabled={loading}>
        Generate Recipe
      </button>
      {loading && <p className={styles.loading}>Loading...</p>}
      <pre className={styles.responseBox}>{response}</pre>
    </div>
  );
};

export default AdminPage;
