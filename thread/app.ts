import express from 'express';
import { ChatService } from './ChatService';

const app = express();
const port = 3000;

// Middleware configuration
app.use(express.json());

// Initialize chat service
const chatService = new ChatService();

/**
 * POST /api/chat
 * Handles individual chat messages
 */
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || !message.role || !message.content) {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  try {
    const response = await chatService.processMessage(message);
    res.json(response);
  } catch (error) {
    console.error('Error in chat processing:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

/**
 * POST /api/demo
 * Runs a demo conversation
 */
app.post('/api/demo', async (req, res) => {
  try {
    const response = await chatService.runDemo();
    res.json(response);
  } catch (error) {
    console.error('Error in demo:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Listening for POST /api/chat and POST /api/demo requests');
});