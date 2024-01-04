export async function fetchSearchResults(query: string, limit: number) {
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    console.log("SEARCH RESULTS:", data);
    return data;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return null;
  }
}
