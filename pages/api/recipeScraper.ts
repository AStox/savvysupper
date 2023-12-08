import axios from "axios";
import cheerio from "cheerio";
import { NextApiRequest, NextApiResponse } from "next";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  serves: string;
  cookingMinutes: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = "https://www.jamieoliver.com/recipes/chicken-recipes/non-nuclear-fire-noodles/";
  const { data } = await axios.get(url);
  console.log("!!", data);
  const $ = cheerio.load(data);

  const title = $("h1.hidden-xs").text().trim();
  const ingredients = $("ul.ingred-list > li")
    .map((i, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get();
  const instructions = $("ol.recipeSteps > li")
    .map((i, el) => $(el).text().trim())
    .get();
  const serves = $(".recipe-detail.serves")
    .text()
    .trim()
    .replace("Serves", "")
    .trim()
    .replace("Serves", "")
    .trim();
  const timeText = $(".recipe-detail.time").text().trim();
  console.log("!!", timeText);
  const cookingMinutes = timeText.replace("Cooks In", "").replace("minutes", "").trim();

  // Placeholder value for preparation minutes as it's not available in the HTML snippet
  const preparationMinutes = 0;

  const recipe: Recipe = {
    title,
    ingredients,
    instructions,
    serves,
    cookingMinutes,
  };

  res.status(200).json(recipe);
}
