// File: api/getMeal.ts

import cohere from "cohere-ai";
import { queryWeaviate } from "../utils/Weaviate";

const getMeal = async (req, res) => {
  // Load API Key
  const apiKey = process.env.COHERE_API_KEY;

  // Check if API Key is available
  if (!apiKey) {
    res.status(500).send("API key is missing");
    return;
  }

  // Initialize Cohere Client
  cohere.init(apiKey);

  try {
    // Query Weaviate
    const proteinDocuments = await queryWeaviate("protein", 3);
    const vegetableDocuments = await queryWeaviate("vegetable", 6);
    const carbDocuments = await queryWeaviate("carbohydrate", 2);
    const documents = proteinDocuments.concat(vegetableDocuments, carbDocuments);

    const chatHistory = [
      {
        role: "USER",
        message: `Use RAG and the provided documents containing grocery sale information to generate a recipe using as many of the items as reasonably possible.
        You should prioritize making a realistic recipe over using as many items as possible however. 
        Feel free to add in items that aren't on sale if you think it will make the recipe more realistic. 
        And tell me the pricing information for each ingredient where this information can be cited using the attached documents. 
        If you don't know an ingredients price then just say N/A. Here's an example recipe. 
        Always follow an identical format when responding and only respond with a recipe. No extra words.

        ## Sweet Potato and Chicken Hash

        **Ingredients:**
        - 2 sweet potatoes
        - 4 chicken breasts
        - 1 red onion
        - 1 zucchini
        - 1 head of broccoli
        - 1/2 cup of cooked brown rice
        - 1/4 cup of olive oil
        - 1/2 teaspoon of salt
        - 1/4 teaspoon of black pepper

        **Instructions:**
        1. Preheat oven to 425°F.
        2. Chop all vegetables.
        3. In a large bowl, toss sweet potatoes, zucchini, onion, and broccoli with olive oil, salt, and pepper.
        4. Spread the vegetables on a baking sheet and roast in the oven for 25 minutes.
        5. Cook the brown rice as per the instructions on the package.
        6. Meanwhile, heat a large non-stick skillet over medium-high heat and cook the chicken breasts for 6-8 minutes on each side or until cooked through.
        7. Once the vegetables are roasted, add the rice and chicken to the bowl and toss to combine.
        8. Serve immediately and enjoy!

        **Pricing Information:**
        - Sweet Potato (price: $1.12, Savings: $3.27)
        - Chicken Breast (price: $4.61, Savings: $18.52)
        - Red Onion (price: $1.32, Savings: $4.61)
        - Zucchini (price: $1.08, Savings: $4.85)
        - Broccoli (price: N/A)
        - Brown Rice (price: N/A)
        - Olive Oil (price: N/A)
        - Salt (price: N/A)
        - Black Pepper (price: N/A)

        Total Savings: $31.25
        `,
      },
    ];
    const message = "Generate the first recipe";

    const response = await cohere.chat({
      chat_history: chatHistory,
      message: message,
      documents: documents,
      temperature: 0.9,
    });

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(`Error processing request: ${error.message}`);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};

export default getMeal;
