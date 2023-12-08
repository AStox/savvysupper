import { OpenAIChatClient } from "./_OpenAIChatClient";
import { documents } from "./_documents";
import type { NextApiRequest, NextApiResponse } from "next";

export const getStaticProps: GetStaticProps = async () => {
  const recipes = await prisma.recipe.findMany();
  return {
    props: { recipes: recipes },
    revalidate: 10,
  };
};

type Props = {
  recipes: any[];
};

export default async function getMeal(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.status(500).send("No OpenAI API key found");
    return;
  }

  try {
    // const cleanMessage = (message: string): string => {
    //   return message.replace(/\+/g, " ").replace(/�/g, "°");
    // };

    const chatHistory = [
      {
        role: "system",
        content: `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes using as many of the sale items as possible.
        Be sure to cite pricing data for all ingredients pulled from the list of sale data. Any ingredients not on sale should be listed with a cost of 0.
        Always respond in valid JSON, following an identical structure to the following examples. cost and savings fields should be numbers not strings.
    
        EXMAPLE SALE DATA:
        [
          { name: "Sweet Potato", cost: 1.12, savings: 3.27 },
          { name: "Chicken Breast", cost: 4.61, savings: 18.52 },
          { name: "Red Onion", cost: 1.32, savings: 4.61 },
          { name: "Zucchini", cost: 1.08, savings: 4.85 },
        ]
    
        EXAMPLE RECIPES USING SALE DATA:
        {
          title: "Sweet Potato and Chicken Hash",
          ingredients: [
            "2 sweet potatoes",
            "4 chicken breasts",
            "1 red onion",
            "1 zucchini",
            "1 head of broccoli",
            "1/2 cup of cooked brown rice",
            "1/4 cup of olive oil",
            "1/2 teaspoon of salt",
            "1/4 teaspoon of black pepper"
          ],
          instructions: [
            "Preheat oven to 425°F.",
            "Chop all vegetables.",
            "In a large bowl, toss sweet potatoes, zucchini, onion, and broccoli with olive oil, salt, and pepper.",
            "Spread the vegetables on a baking sheet and roast in the oven for 25 minutes.",
            "Cook the brown rice as per the instructions on the package.",
            "Meanwhile, heat a large non-stick skillet over medium-high heat and cook the chicken breasts for 6-8 minutes on each side or until cooked through.",
            "Once the vegetables are roasted, add the rice and chicken to the bowl and toss to combine.",
            "Serve immediately and enjoy!"
          ],
          pricing: [
            { name: "Sweet Potato", cost: 1.12, savings: 3.27 },
            { name: "Chicken Breast", cost: 4.61, savings: 18.52 },
            { name: "Red Onion", cost: 1.32, savings: 4.61 },
            { name: "Zucchini", cost: 1.08, savings: 4.85 },
            { name: "Broccoli", cost: 0, savings: 0 },
            { name: "Brown Rice", cost: 0, savings: 0 },
            { name: "Olive Oil", cost: 0, savings: 0 },
            { name: "Salt", cost: 0, savings: 0 },
            { name: "Black Pepper", cost: 0, savings: 0 }
          ],
       }`,
      },
      {
        role: "system",
        content: `GROCERY SALE DATA:
        ${JSON.stringify(documents)}`,
      },
    ];

    // const message: string = "Generate the next recipe";

    // chatHistory.push({
    //   content: cleanMessage(message),
    //   role: "user",
    // });
    console.log("CHAT HISTORY:", chatHistory);

    const chatClient = new OpenAIChatClient(apiKey);
    const response = await chatClient.chat(chatHistory, documents);

    console.log("RESPONSE FROM API:", response);

    // Parse JSON part (if needed, uncomment and adjust this section based on your requirements)
    // let jsonData: any;
    // try {
    //   jsonData = JSON.parse(jsonPart);
    //   // Additional JSON processing can be added here
    // } catch (error) {
    //   // Error handling for JSON parsing
    // }

    // Return response (adjust this part based on your specific data structure and requirements)
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .send(`Error processing request:${error.stack}, ${error.name}, ${error.message}`);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
}
