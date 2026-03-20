const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema
const promptSchema = new mongoose.Schema({
  prompt: String,
  response: String,
  timestamp: { type: Date, default: Date.now }
});

const PromptModel = mongoose.model('Prompt', promptSchema);

// OpenRouter API Configuration
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_ID = 'openrouter/auto';

// API Routes
app.post('/api/ask-ai', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL_ID,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mern-task-flow.onrender.com', // Updated for production
          'X-Title': 'MERN-Task-Flow'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('OpenRouter API error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

app.post('/api/save', async (req, res) => {
  const { prompt, response } = req.body;

  if (!prompt || !response) {
    return res.status(400).json({ error: 'Prompt and response are required' });
  }

  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
    return res.status(503).json({ error: 'Database connection is not ready' });
  }

  try {
    const newPrompt = new PromptModel({ prompt, response });
    await newPrompt.save();
    res.json({ message: 'Data saved successfully', data: newPrompt });
  } catch (error) {
    console.error('Detailed MongoDB save error:', error.message);
    res.status(500).json({ error: `Failed to save data: ${error.message}` });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await PromptModel.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error('MongoDB fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*path', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

