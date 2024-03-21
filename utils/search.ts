export async function fetchSearchResults(query: string, limit: number, onSale: boolean) {
  try {
    const response = await fetch(
      `/api/searchCollection?query=${encodeURIComponent(query)}&limit=${limit}&onSale=${onSale}`
    );
    if (!response.ok) {
      console.log("RESPONSE NOT OK:", response);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return null;
  }
}

export async function fetchSearchByTitle(query: string) {
  try {
    const response = await fetch(`/api/searchCollection?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.log("RESPONSE NOT OK:", response);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return null;
  }
}
