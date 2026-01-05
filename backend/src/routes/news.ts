import express from 'express';
import { prisma } from '../lib/prisma';
import { fetchNewsFromSources, fetchNewsFromNewsAPI } from '../services/newsService';

const router = express.Router();

// GET all news items
router.get('/', async (req, res) => {
  try {
    const { sourceId, read } = req.query;
    const where: any = {};
    if (sourceId) where.sourceId = sourceId;
    if (read !== undefined) where.read = read === 'true';

    const newsItems = await prisma.newsItem.findMany({
      where,
      include: { source: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(newsItems);
  } catch (error) {
    console.error('Failed to fetch news items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news items',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// POST refresh news (fetch from all sources)
router.post('/refresh', async (req, res) => {
  try {
    await fetchNewsFromSources();
    res.json({ message: 'News refreshed successfully' });
  } catch (error) {
    console.error('Failed to refresh news:', error);
    res.status(500).json({ 
      error: 'Failed to refresh news',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// POST fetch from News API
router.post('/newsapi', async (req, res) => {
  try {
    const { query } = req.body;
    const articles = await fetchNewsFromNewsAPI(query);
    res.json(articles);
  } catch (error) {
    console.error('Failed to fetch from News API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch from News API',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// GET all news sources (must come before /:id route)
router.get('/sources', async (req, res) => {
  try {
    const sources = await prisma.newsSource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(sources);
  } catch (error) {
    console.error('Failed to fetch news sources:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news sources',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// POST create news source
router.post('/sources', async (req, res) => {
  try {
    const { name, url, type, enabled } = req.body;
    const source = await prisma.newsSource.create({
      data: {
        name,
        url,
        type: type || 'rss',
        enabled: enabled !== undefined ? enabled : true,
      },
    });
    res.status(201).json(source);
  } catch (error) {
    console.error('Failed to create news source:', error);
    res.status(500).json({ 
      error: 'Failed to create news source',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// DELETE news source
router.delete('/sources/:id', async (req, res) => {
  try {
    await prisma.newsSource.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete news source:', error);
    res.status(500).json({ 
      error: 'Failed to delete news source',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// PUT mark news item as read/unread
router.put('/:id/read', async (req, res) => {
  try {
    const { read } = req.body;
    const newsItem = await prisma.newsItem.update({
      where: { id: req.params.id },
      data: { read: read !== undefined ? read : true },
    });
    res.json(newsItem);
  } catch (error) {
    console.error('Failed to update news item:', error);
    res.status(500).json({ 
      error: 'Failed to update news item',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// GET news item by ID (must come after all specific routes)
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await prisma.newsItem.findUnique({
      where: { id: req.params.id },
      include: { source: true },
    });
    if (!newsItem) {
      return res.status(404).json({ error: 'News item not found' });
    }
    res.json(newsItem);
  } catch (error) {
    console.error('Failed to fetch news item:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news item',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

export default router;
