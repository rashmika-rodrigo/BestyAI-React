import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares to allow cross-origin requests and parse JSON
app.use(cors());
app.use(express.json());

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Define the main chat endpoint
app.post("/chat", async (req, res) => {
  try {
    // Get the chat history and the user's message from the request body
    const { history, message } = req.body;
    
    // Select the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Start a chat session with the provided history
    const chat = model.startChat({
      history: history,
    });

    // Send the user's message to the model
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    // Send the model's response back to the client
    res.send({ message: text });

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});