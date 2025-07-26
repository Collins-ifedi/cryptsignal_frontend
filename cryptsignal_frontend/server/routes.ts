import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import fetch from 'node-fetch'; // Import fetch for making HTTP requests

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteConversation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        content: content.trim(),
      });

      // Get the userId from the request (assuming middleware adds it)
      const userId = (req as any).userId || 1; // Default to 1 for safety

      // Call the AI backend to get a response
      const aiResponseContent = await generateAIResponse(content, userId);
      
      // Save AI response
      const aiMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        content: aiResponseContent,
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Clear conversation messages
  app.delete("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      await storage.deleteMessages(conversationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Connects to the Python AI backend to get a real response
async function generateAIResponse(userMessage: string, userId: number): Promise<string> {
  // The URL of the new endpoint in your Python server.py
  const pythonApiUrl = 'https://cryptsignal-backend.onrender.com/api/generate';

  try {
    const response = await fetch(pythonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the user's message and ID to the backend
      body: JSON.stringify({
        query: userMessage,
        userId: userId,
      }),
      // Set a reasonable timeout for the request
      timeout: 60000,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Python server error: ${response.status}`, errorBody);
      return `Sorry, the AI service returned an error. Please try again later.`;
    }

    const data = await response.json();
    // Return the 'response' field from the JSON payload
    return data.response || "Received an empty response from the AI.";

  } catch (error) {
    console.error("Failed to communicate with the Python AI backend:", error);
    // Return a user-friendly error message
    return "Sorry, I'm having trouble connecting to my AI services right now.";
  }
}