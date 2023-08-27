import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser';

import { config } from "dotenv";
config();

import OpenAI from "openai";
console.log(process.env.API_KEY);
const openai = new OpenAI({
  apiKey: process.env.API_KEY
});


// OpenAI related imports and configuration here...

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'page.html'));
});

app.post('/summarize', async (req, res) => {
  const text = req.body.text;  // get the text from the request body

  const msg = {
    role: "user",
    content: text,
  };

  let messages = [{
    role: "system",
    content: "Hello, I need your help with a task. This task involves reading a text, and based on its content, I would like you to provide ideas on how the user could utilize their 'preferred input' to design their website by for example always start the sentence with: Based on the text provided and don't use the word 'user' anywhere. Create bullet points.",
  }, msg];

  try {
    const resOpenAI = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    if (resOpenAI.choices && resOpenAI.choices.length > 0) {
      let aiResponse = resOpenAI.choices[0].message.content;
      aiResponse += "\n\nThis is a recommendation, so feel free to adjust it to meet your product and creativity.";
      res.json({ summary: aiResponse });
    } else {
      throw new Error("Invalid response from OpenAI API");
    }
  } catch (error) {
    // Graceful error handling
    console.error("An error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
