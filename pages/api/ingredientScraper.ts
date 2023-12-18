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

const pages = {
  "Fresh Fruits & Vegetables": [
    "Fresh Fruits",
    "Fresh Vegetables",
    "Fresh Cut Fruits & Vegetables",
    "Fresh Herbs",
    "Fresh Organic Fruits",
    "Fresh Organic Vegetables",
  ],
  "Meat & Seafood": [
    "Beef & Veal",
    "Chicken",
    "Pork",
    "Turkey",
    "Lamb",
    "Fish",
    "Exotic Meats",
    "Fish & Seafood",
    "Bacon",
    "Hot Dogs & Sausages",
  ],
  "Dairy & Eggs": [
    "Milk",
    "Cream & Creamers",
    "Butter & Margarine",
    "Yogurt",
    "Sour Cream",
    "Whipped Cream",
    "Eggs",
  ],
  Cheese: [
    "Artisan Cheese",
    "Shredded & Grated Cheese",
    "Block Cheese",
    "Cottage Cheese",
    "Soft & Spreadable Cheese",
    "Cream Cheese",
  ],
};

async function findLink(page: Page, linkText: string): Promise<string | null> {
  // Use XPath to find the link based on its text content
  const linkXPath = `//a[contains(text(), "${linkText}")]`;
  const links = await page.$x(linkXPath);

  if (links.length > 0) {
    const href = await page.evaluate((el) => el.getAttribute("href"), links[0]);
    return href ? `https://voila.ca${href}` : null;
  }

  return null;
}

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
        const priceElements = el.querySelectorAll('div[data-test="fop-price-wrapper"] span');
        const prices = Array.from(priceElements)
          .map((span) => span.textContent?.trim())
          .filter((text) => text && text.startsWith("$"));

        const regularPrice = onSale
          ? prices.length > 1
            ? parseFloat(prices[1].replace("$", ""))
            : parseFloat(prices[0].replace("$", ""))
          : currentPrice;

        return { title, quantity, currentPrice, onSale, regularPrice };
      })
    );

    newItems.forEach((item) => {
      if (item.title && item.currentPrice > 0) {
        if (!addedTitles.has(item.title)) {
          items.push(item as Ingredient);
          addedTitles.add(item.title);
        }
      }
    });
    console.log("scraping page... found", items.length, "items so far");

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1000);
    console.log("scrolling...");

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
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Calculate the total number of subcategories to be scraped
    const totalSubcategories = Object.values(pages).flat().length;
    let currentSubcategoryNumber = 0;

    for (const category in pages) {
      // Navigate to the main navigation page before each category
      await page.goto("https://voila.ca/products?source=navigation", { waitUntil: "networkidle2" });

      const categoryLink = await findLink(page, category);
      if (!categoryLink) throw new Error(`${category} link not found`);
      await page.goto(categoryLink, { waitUntil: "networkidle2" });

      let allCategoryItems: Ingredient[] = [];

      for (const subcategory of pages[category]) {
        currentSubcategoryNumber++;
        console.log(
          `Scraping page ${currentSubcategoryNumber}/${totalSubcategories}: ${subcategory} in ${category}`
        );

        const subcategoryLink = await findLink(page, subcategory);
        if (!subcategoryLink) throw new Error(`${subcategory} link not found`);
        await page.goto(subcategoryLink, { waitUntil: "networkidle2" });

        const items = await scrapeUrl(page, subcategoryLink);
        allCategoryItems = allCategoryItems.concat(items);

        // Navigate back to the main category page before moving to the next subcategory
        await page.goto(categoryLink, { waitUntil: "networkidle2" });
      }

      // Write results to a file for each category
      fs.writeFileSync(
        `${category.replace(/\s+/g, "_")}_ingredients.json`,
        JSON.stringify(allCategoryItems, null, 2)
      );
    }

    console.log("Scraping completed for all categories");
    res.status(200).json({ message: "Scraping completed for all categories" });
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).json({ error: "Error during scraping" });
    return;
  } finally {
    await browser.close();
  }
}
