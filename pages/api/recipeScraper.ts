import puppeteer, { Browser } from "puppeteer";
import { NextApiRequest, NextApiResponse } from "next";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  serves: string;
  cookingMinutes: string;
}

async function scrapeRecipe(browser: Browser, url: string): Promise<Recipe | null> {
  // Launch Puppeteer browser
  // const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);

  // Wait for the selector that indicates the page has loaded the needed content
  await page.waitForSelector("h1.hidden-xs");

  // Execute code in the context of the page
  const recipeData = await page.evaluate(() => {
    const title =
      document.querySelector("h1.hidden-xs")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const ingredients = Array.from(
      document.querySelectorAll("ul.ingred-list > li"),
      (element) => element.textContent?.replace(/\s+/g, " ").trim() ?? ""
    );
    const instructions = Array.from(
      document.querySelectorAll("ol.recipeSteps > li"),
      (element) => element.textContent?.replace(/\s+/g, " ").trim() ?? ""
    );
    if (document.querySelector(".recipe-detail.serves")?.textContent?.includes("as a side")) {
      console.log("!!!!!!!!!!");
      console.log("!!!!!!!!!!");
      console.log("!!!!!!!!!!");
      console.log("!!!!!!!!!!");
      return;
    }
    const serves =
      document
        .querySelector(".recipe-detail.serves")
        ?.textContent?.replace("Serves", "")
        .replace(/\s+/g, " ")
        .trim() ?? "";
    const cookingMinutes =
      document
        .querySelector(".recipe-detail.time")
        ?.textContent?.replace("Cooks In", "")
        .replace("Time", "")
        .replace(/\s+/g, " ")
        .trim() ?? "";

    return { title, ingredients, instructions, serves, cookingMinutes };
  });
  // skip
  if (!recipeData) {
    return null;
  }
  return recipeData;
}

async function scrapeFilteredLinks(browser: Browser, url: string): Promise<string[]> {
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Wait for the recipes to load - assuming they are loaded soon after the <a> tags appear
  await page.waitForSelector("a");

  // Scrape links that match the pattern
  const links = await page.evaluate(() => {
    const linkElements = Array.from(document.querySelectorAll("a[href]"));
    const pattern = /\/[a-z]+-recipes\/[a-z-]+\/$/i; // Regular expression to match the pattern
    return linkElements
      .map((element) => element.getAttribute("href"))
      .filter((href): href is string => typeof href === "string" && pattern.test(href));
  });

  return links.map((link) => `https://www.jamieoliver.com${link}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const browser = await puppeteer.launch({ headless: "new" });
  const categories = [
    "vegetables",
    // "eggs",
    // "chicken",
    // "pasta",
    // "lamb",
    // "fruit",
    // "beef",
    // "pork",
    // "fish",
    // "pasta",
    // "cheese",
    // "rice",
    // "prawn",
    // "turkey",
    // "mussels",
    // "seafood",
    // "chicken-breast",
    // "salmon",
  ];
  const allRecipeUrls: string[] = [];

  for (const category of categories) {
    const categoryUrl = `https://www.jamieoliver.com/recipes/${category}-recipes/`;
    const urls = await scrapeFilteredLinks(browser, categoryUrl);
    allRecipeUrls.push(...urls);
    console.log(`Scraped ${urls.length} recipe links from ${category} category.`);
  }

  const recipes = [];
  for (let i = 0; i < allRecipeUrls.length; i++) {
    const url = allRecipeUrls[i];
    const data = await scrapeRecipe(browser, url);
    if (!data) {
      console.log(`Skipping ${i + 1} / ${allRecipeUrls.length} recipes.`);
      continue;
    }
    const recipe: Recipe = {
      title: data.title as string,
      ingredients: data.ingredients as string[],
      instructions: data.instructions as string[],
      serves: data.serves as string,
      cookingMinutes: data.cookingMinutes as string,
    };
    recipes.push(recipe);
    console.log(recipe);
    console.log(`Scraped ${i + 1} / ${allRecipeUrls.length} recipes.`);
  }

  console.log("Scraping completed.");
  await browser.close();
  res.status(200).json(recipes);
}
