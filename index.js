const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

require("dotenv").config();

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

const cors = require("cors");
app.use(cors());

function decryptApiToken(encryptedData) {
  console.log(encryptedData, "encryptedData");
  // Decode from Base64
  const combined = Buffer.from(encryptedData, "base64");

  // Extract IV, encrypted data, key, and auth tag
  const iv = combined.slice(0, 12);
  const key = combined.slice(-32);
  const encryptedToken = combined.slice(12, -32);

  // In GCM mode, the auth tag is appended to the ciphertext
  const authTag = encryptedToken.slice(-16);
  const ciphertext = encryptedToken.slice(0, -16);

  // Create decipher
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(ciphertext, "binary", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

app.get("/", (req, res) => {
  res.send("Successful response.");
});

app.post("/ask", async (req, res) => {
  //   console.log(req.body);
  const { question, transcript, token } = req.body;
  console.log(question, "question");
  console.log(token, "token");
  const prompt = `Here is the YouTube video transcript: "${transcript?.transcript?.transcript}". Answer the following question concisely : "${question}"`;
  if (!question || !transcript || !token) {
    return res
      .status(400)
      .json({ error: "Question and transcript are required" });
  }

  try {
    const decryptedToken = decryptApiToken(token);

    const openai = new OpenAI({
      apiKey: decryptedToken,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });

    const answer = completion.choices[0].message.content;
    console.log(answer, "completion choice");

    res.json({ answer });
    // res.json({ answer: "Yahoo!" });
  } catch (error) {
    console.error("Error", error);
    res.json({ answer: error.message });
  }
});

app.listen(3000, () => console.log("Example app is listening on port 3000."));
