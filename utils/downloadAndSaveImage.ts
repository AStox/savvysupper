export async function downloadAndSaveImage(imageUrl: string, filename: string) {
  try {
    const response = await fetch("/api/downloadAndSaveImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl, filename }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error("Failed to upload image:", error);
  }
}
