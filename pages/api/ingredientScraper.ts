import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Page } from "puppeteer";
import prisma from "@/lib/prisma";

export interface Ingredient {
  title: string;
  quantity: string;
  currentPrice: number;
  regularPrice: number;
  onSale: boolean;
  dateAdded?: Date;
  embedding?: number[];
}

const pages = {
  name: "Root",
  children: [
    // {
    //   name: "Fresh Fruits & Vegetables",
    //   children: [
    //     "Fresh Fruits",
    //     "Fresh Vegetables",
    //     "Fresh Cut Fruits & Vegetables",
    //     "Fresh Herbs",
    //     "Fresh Organic Fruits",
    //     "Fresh Organic Vegetables",
    //   ],
    // },
    // {
    //   name: "Meat & Seafood",
    //   children: [
    //     "Beef & Veal",
    //     "Chicken",
    //     "Pork",
    //     "Turkey",
    //     "Lamb",
    //     "Fish",
    //     "Fish & Seafood",
    //     "Bacon",
    //     "Hot Dogs & Sausages",
    //   ],
    // },
    // {
    //   name: "Dairy & Eggs",
    //   children: [
    //     "Milk",
    //     "Cream & Creamers",
    //     "Butter & Margarine",
    //     "Yogurt",
    //     "Sour Cream",
    //     "Whipped Cream",
    //     "Eggs",
    //   ],
    // },
    // {
    //   name: "Cheese",
    //   children: [
    //     "Artisan Cheese",
    //     "Shredded & Grated Cheese",
    //     "Block Cheese",
    //     "Cottage Cheese",
    //     "Soft & Spreadable Cheese",
    //     "Cream Cheese",
    //   ],
    // },
    // {
    //   name: "Pantry",
    //   children: [
    //     {
    //       name: "Pasta, Noodles & Sauce",
    //       children: ["Dry Pasta & Noodles", "Fresh Pasta", "Pasta Sauce"],
    //     },
    //     {
    //       name: "Rice, Grains & Legumes",
    //       children: [
    //         "Dry Rice",
    //         "Cornmeal",
    //         "Couscous",
    //         "Quinoa",
    //         "Specialty Grains",
    //         "Dry Beans",
    //         "Canned Beans",
    //         "Dry Lentils",
    //         "Canned Lentils",
    //         "Dry Peas",
    //         "Canned Chickpeas",
    //         "Barley",
    //       ],
    //     },
    //     "Condiments",
    //     "Spices & Seasoning",
    //     "Marinades & Sauces",
    //     "Oils, Vinegars & Salad Dressing",
    //     {
    //       name: "Canned & Pickled",
    //       children: [
    //         "Canned Baked Beans",
    //         "Canned Fruit",
    //         "Canned Tomatoes",
    //         "Canned Vegetables",
    //         "Marinated Vegetables",
    //         "Olives",
    //         "Pickles",
    //       ],
    //     },
    //     {
    //       name: "Soup & Broth",
    //       children: ["Broth & Bouillon"],
    //     },
    //   ],
    // },
    // {
    //   name: "International Foods",
    //   children: [
    //     "Indian & South Asian",
    //     "Caribbean",
    //     "Chinese & East Asian",
    //     "Thai & Southeast Asian",
    //     "International Fresh Fruits & Vegetables",
    //     "Latin",
    //   ],
    // },
    {
      name: "Plant Based",
      children: ["Meat Alternatives", "Tofu"],
    },
  ],
};

async function findLink(page: Page, linkText: string): Promise<string | null> {
  // Use XPath to find the link based on its text content
  const linkXPath = `//a[contains(text(), "${linkText}")]`;
  const links = await page.$x(linkXPath);

  if (links.length > 0) {
    const href = await page.evaluate((el: any) => el.getAttribute("href"), links[0]);
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

    const newItems: Ingredient[] = await page.$$eval('div[data-test="fop-body"]', (elements) =>
      elements.map((el) => {
        const title =
          el
            .querySelector('h3[data-test="fop-title"]')
            ?.textContent?.trim()
            .replace(/^(.*?)\s+\d+(\.\d+)?\s+\w+.*$/, "$1") || "";

        const quantity =
          el.querySelector(".weight__SingleTextLine-sc-1sjeki5-0")?.textContent?.trim() || "1 ea";
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
            ? parseFloat((prices[1] || "").replace("$", ""))
            : parseFloat((prices[0] || "").replace("$", ""))
          : currentPrice;
        return { title, quantity, currentPrice, onSale, regularPrice };
      })
    );

    newItems.forEach((item: Ingredient) => {
      if (item.title && item.currentPrice > 0) {
        if (!addedTitles.has(item.title)) {
          items.push(item as Ingredient);
          addedTitles.add(item.title);
        }
      }
      const offset = -5; // EST is UTC-5
      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + offset);

      item = { ...item, dateAdded: currentDate };
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

async function navigateToCategory(page: Page, categoryName: string): Promise<string> {
  const topLevelCategories = new Set(
    pages.children.map((cat) => (typeof cat === "string" ? cat : cat.name))
  );

  if (topLevelCategories.has(categoryName)) {
    console.log("Navigating to main products page for top-level category...");
    await page.goto("https://voila.ca/products", { waitUntil: "networkidle2" });
  }

  console.log(`Finding link for category: ${categoryName}`);
  const categoryLink = await findLink(page, categoryName);
  if (!categoryLink) throw new Error(`${categoryName} link not found`);

  console.log(`Navigating to category: ${categoryName} (${categoryLink})`);
  await page.goto(categoryLink, { waitUntil: "networkidle2" });
  return categoryLink;
}

function isWithinLastWeek(date: Date): boolean {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return date > oneWeekAgo;
}

async function scrapeFirstItemInSubcategory(
  page: Page,
  url: string
): Promise<{ title: string } | null> {
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForSelector('h3[data-test="fop-title"]');

  const firstItem = await page.$eval('div[data-test="fop-body"]', (element) => {
    const title = element.querySelector('h3[data-test="fop-title"]')?.textContent?.trim();
    return title ? { title } : null;
  });

  return firstItem;
}

async function shouldScrapeSubcategory(title: string): Promise<boolean> {
  const recentItem = await prisma.ingredient.findFirst({
    where: {
      title,
    },
    orderBy: {
      dateAdded: "desc",
    },
  });
  console.log(recentItem);
  if (recentItem && recentItem.dateAdded) {
    return !isWithinLastWeek(recentItem.dateAdded);
  }

  return true;
}

async function processSubcategory(page: Page, categoryPath: string[], subcategoryName: string) {
  // Iterate through each category in the path
  for (const categoryName of categoryPath) {
    await navigateToCategory(page, categoryName);
  }

  // Now process the subcategory
  const subcategoryLink = await navigateToCategory(page, subcategoryName);

  // const firstItem = await scrapeFirstItemInSubcategory(page, subcategoryLink);

  // if (!firstItem || !firstItem.title) {
  //   console.log(`Could not scrape the first item in ${subcategoryName}, skipping...`);
  //   return;
  // }

  // const scrapeNeeded = await shouldScrapeSubcategory(firstItem.title);
  // if (!scrapeNeeded) {
  //   console.log(`Skipping ${subcategoryName}, data for '${firstItem.title}' is up-to-date.`);
  //   return;
  // }

  console.log(`Scraping data from subcategory: ${subcategoryName}`);
  const items = await scrapeUrl(page, subcategoryLink);

  await prisma.ingredient.createMany({
    data: items,
  });
}

async function processCategories(page: Page, categories: any, categoryPath: string[] = []) {
  for (const category of categories) {
    if (typeof category === "string") {
      await processSubcategory(page, categoryPath, category);
    } else {
      await processCategories(page, category.children, [...categoryPath, category.name]);
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // request interception to disable images and CSS
  // await page.setRequestInterception(true);
  // page.on("request", (request) => {
  //   if (request.resourceType() === "image" || request.resourceType() === "stylesheet") {
  //     request.abort();
  //   } else {
  //     request.continue();
  //   }
  // });

  try {
    console.log("Navigating to main products page...");
    await page.goto("https://voila.ca/products", { waitUntil: "networkidle2" });

    console.log("Starting the scraping process...");
    await processCategories(page, pages.children);

    console.log("Scraping completed for all categories");
    res.status(200).json({ message: "Scraping completed for all categories" });
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).json({ error: "Error during scraping" });
    return;
  } finally {
    console.log("Closing browser...");
    await browser.close();
  }
}
