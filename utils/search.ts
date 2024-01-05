export async function fetchSearchResults(query: string, limit: number) {
  try {
    const response = await fetch(
      `/api/searchCollection?query=${encodeURIComponent(query)}&limit=${limit}`
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
