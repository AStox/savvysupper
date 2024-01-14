import fetch from "node-fetch";
import { put } from "@vercel/blob";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { imageUrl, filename } = req.body;
      const uploadedImageUrl = await downloadAndSaveImage(imageUrl, filename);
      res.status(200).json({ url: uploadedImageUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

export async function downloadAndSaveImage(imageUrl: string, filename: string) {
  // Download image from the external URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const imageBuffer = await response.buffer();

  // Upload the image to Vercel Blob
  const blob = await put(filename, imageBuffer, {
    access: "public",
    contentType: response.headers.get("content-type") as string,
  });

  return blob.url;
}
