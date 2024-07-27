const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

app.get("/", (req, res) => {
  res.send("Successful response.");
});

app.post("/ask", async (req, res) => {
  const { question, transcript } = req.body;
  console.log(question, transcript);
  const prompt = `Here is the YouTube video transcript: "${transcript?.transcript?.transcript}". Answer the following question concisely: "${question}"`;
  if (!question || !transcript) {
    return res
      .status(400)
      .json({ error: "Question and transcript are required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });

    console.log(completion.choices[0], "completion choice");
    const answer = completion.choices[0].message.content;

    res.json({ answer });
  } catch (error) {
    console.error("Error interacting with OpenAI API:", error);
    res.status(400).json({ error: "Failed to get a response from OpenAI API" });
  }
});

app.listen(3000, () => console.log("Example app is listening on port 3000."));
