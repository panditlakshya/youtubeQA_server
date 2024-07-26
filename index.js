const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

app.get("/", (req, res) => {
  res.send("Successful response.");
});

app.post("/ask", async (req, res) => {
  const { question, transcript } = req.body;
  const prompt = `Here is the YouTube video transcript: "${transcript}". Answer the following question concisely: "${question}"`;

  // Interact with ChatGPT API (replace YOUR_API_KEY with actual key)
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Who won the world series in 2020?" },
      {
        role: "assistant",
        content: "The Los Angeles Dodgers won the World Series in 2020.",
      },
      { role: "user", content: "Where was it played?" },
    ],
    model: "gpt-3.5-turbo",
  });

  const data = await response.json();
  const answer = data.choices[0].text.trim();

  res.json({ answer });
});

app.listen(3000, () => console.log("Example app is listening on port 3000."));
