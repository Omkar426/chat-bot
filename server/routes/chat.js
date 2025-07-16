const express = require('express');
const axios = require('axios');
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const messages = await Message.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(messages);
});

router.post('/', auth, async (req, res) => {
  const { text } = req.body;

  try {
    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [{ parts: [{ text }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );

    console.log('Gemini Response:', geminiResponse.data);
    const reply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";

    const message = new Message({
      userId: req.user.id,
      userText: text,
      botResponse: reply
    });
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch response from Gemini' });
  }
});

// DELETE /api/chat - Clear chat history for the logged-in user
router.delete('/', auth, async (req, res) => {
  try {
    await Message.deleteMany({ userId: req.user.id });
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    console.error('Error clearing chat:', err);
    res.status(500).json({ error: 'Failed to delete chat history' });
  }
});


module.exports = router;
