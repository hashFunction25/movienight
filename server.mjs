import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json());

app.use(express.static("public")); // Serve index.html for root URL

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/generate-theme", async (req, res) => {
  const { movieName } = req.body;
  console.log(`Received request to generate theme for movie: ${movieName}`);

  try {
    const response = await fetch(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `Create a themed event night for the movie "${movieName}". Include food, drinks, games, and a movie screening. Format the response with bullet points and colons.`,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("API Error:", errorText);
      res.status(response.status).send(errorText);
      return;
    }
    const data = await response.json();
    console.log("API Response:", data);
    res.json(data.choices[0].text);
  } catch (error) {
    console.error("Request Error:", error);

    res.status(500).send("An error occurred while processing your request.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

