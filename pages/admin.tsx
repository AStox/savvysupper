import React, { useState } from "react";
import styles from "./admin.module.css";

const AdminPage = () => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

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

  const vectorizeAndStore = async () => {
    setLoading(true);
    setResponse("");
    const response = await fetch("/api/vectorizeAndStore", { method: "POST" });
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

  return (
    <div className={styles.adminContainer}>
      <button className={styles.button} onClick={createCollection} disabled={loading}>
        Create Collection
      </button>
      <button className={styles.button} onClick={dropCollection} disabled={loading}>
        Drop Collection
      </button>
      <button className={styles.button} onClick={vectorizeAndStore} disabled={loading}>
        Vectorize and Store
      </button>
      <button className={styles.button} onClick={ingredientScraper} disabled={loading}>
        Ingredient Scraper
      </button>
      {loading && <p className={styles.loading}>Loading...</p>}
      <pre className={styles.responseBox}>{response}</pre>
    </div>
  );
};

export default AdminPage;
