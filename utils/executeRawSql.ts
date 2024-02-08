export async function executeRawSQLQuery(query: string) {
  try {
    console.log("QUERY", query);
    const response = await fetch(`/api/rawQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      console.log("RESPONSE NOT OK:", response);
      return response;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return null;
  }
}
