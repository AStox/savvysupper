import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Page } from "puppeteer";
import fs from "fs";

interface Ingredient {
  title: string;
  quantity: string;
  currentPrice: number;
  regularPrice: number;
  onSale: boolean;
}

const meatAndSeafood =
  "https://voila.ca/products?sublocationId=bfe1b4c5-2ada-435c-ab79-e02ddf744d1d";
const fruitsAndVegetables =
  "https://voila.ca/products?sublocationId=43a936d1-df1d-4bf1-a09c-b23c6a8edf63";
const dairyAndEggs = "https://voila.ca/products?sublocationId=4cbdd52d-e935-4f09-a684-8dc22c14bc98";
const cheese = "https://voila.ca/products?sublocationId=48a29c49-0a08-48c2-98bf-83e63f927d19";
const breadAndBakery =
  "https://voila.ca/products?sublocationId=e6ec3585-d317-4729-ab3a-eec5ba88f231";
const plantBased = "https://voila.ca/products?sublocationId=6ef9b3da-5cd8-495e-8dd2-b3f1764ad313";
const international =
  "https://voila.ca/products?sublocationId=a14f9339-0c02-45cd-81a0-1e02c43a0188";

async function scrapeUrl(page: Page, url: string): Promise<Ingredient[]> {
  await page.goto(url, { waitUntil: "networkidle2" });

  let items: Ingredient[] = [];
  let reachedBottom = false;
  let itemLength = 0;
  const maxItems = 1000;
  const addedTitles = new Set();

  while (!reachedBottom && items.length < maxItems) {
    await page.waitForSelector('h3[data-test="fop-title"]');

    const newItems = await page.$$eval('div[data-test="fop-body"]', (elements) =>
      elements.map((el) => {
        const title = el.querySelector('h3[data-test="fop-title"]')?.textContent?.trim();
        const quantity = el
          .querySelector(".weight__SingleTextLine-sc-1sjeki5-0")
          ?.textContent?.trim();
        const currentPrice = parseFloat(
          el.querySelector('span[data-test="fop-price"]')?.textContent?.replace("$", "").trim() ||
            "0"
        );
        const onSale = !!el.querySelector('span[data-test="fop-offer-text"]');
        const regularPrice = onSale
          ? parseFloat(
              el
                .querySelector('div[data-test="fop-price-wrapper"] span:nth-child(2)')
                ?.textContent?.replace("$", "")
                .trim() || "0"
            )
          : currentPrice;

        return { title, quantity, currentPrice, onSale, regularPrice };
      })
    );

    newItems.forEach((item) => {
      if (item.title && item.onSale && item.currentPrice > 0) {
        if (!addedTitles.has(item.title)) {
          items.push(item);
          addedTitles.add(item.title);
        }
      }
    });
    console.log("scraping page... found", items.length, "items so far");

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1000);

    reachedBottom = await page.evaluate(() => {
      return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight;
    });

    // if itemLength is not 0 and the length of items is the same as itemLength, we've reached the end
    if (itemLength !== 0 && items.length === itemLength) {
      reachedBottom = true;
    } else {
      itemLength = items.length;
    }
  }

  return items;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Launch Puppeteer in non-headless mode
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const urls = [
    { name: "meatAndSeafood", url: meatAndSeafood },
    { name: "fruitsAndVegetables", url: fruitsAndVegetables },
    { name: "dairyAndEggs", url: dairyAndEggs },
    { name: "cheese", url: cheese },
    { name: "breadAndBakery", url: breadAndBakery },
    { name: "plantBased", url: plantBased },
    { name: "international", url: international },
  ];

  let allItems: Ingredient[] = [];

  try {
    for (let i = 0; i < urls.length; i++) {
      console.log(`Scraping ${urls[i].name}... (page ${i + 1} of ${urls.length})`);
      const items = await scrapeUrl(page, urls[i].url);
      allItems = allItems.concat(items);
      console.log(`Total scraped items so far: ${allItems.length}`);
    }
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).json({ error: "Error during scraping" });
    return;
  } finally {
    await browser.close();
  }

  console.log(`Total items scraped: ${allItems.length}`);
  // Write results to a file
  fs.writeFileSync("sobeys_ingredients.json", JSON.stringify(allItems, null, 2));

  res
    .status(200)
    .json({ message: "Scraping completed and data written to sobeys_ingredients.json" });
}
