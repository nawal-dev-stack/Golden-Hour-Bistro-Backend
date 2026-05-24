import express from 'express';
import CommunityPost from '../models/CommunityPost.js';

const router = express.Router();

// GET all posts (newest first)
router.get('/', async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).limit(20);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// POST new post
router.post('/', async (req, res) => {
  try {
    const { name, idea } = req.body;
    if (!name || !idea) return res.status(400).json({ message: 'Name and idea are required' });

    const initials = name
      .trim()
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const post = new CommunityPost({ name: name.trim(), idea: idea.trim(), initials });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error saving post' });
  }
});

export default router;
