import express from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { fetchNewsFromSources, fetchNewsFromNewsAPI } from '../services/newsService';

const router = express.Router();
const prisma = new PrismaClient();

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
    res.status(500).json({ error: 'Failed to fetch news items' });
  }
});

// POST refresh news (fetch from all sources)
router.post('/refresh', async (req, res) => {
  try {
    await fetchNewsFromSources();
    res.json({ message: 'News refreshed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh news' });
  }
});

// POST fetch from News API
router.post('/newsapi', async (req, res) => {
  try {
    const { query } = req.body;
    const articles = await fetchNewsFromNewsAPI(query);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from News API' });
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
    res.status(500).json({ error: 'Failed to fetch news sources' });
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
    res.status(500).json({ error: 'Failed to create news source' });
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
    res.status(500).json({ error: 'Failed to delete news source' });
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
    res.status(500).json({ error: 'Failed to update news item' });
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
    res.status(500).json({ error: 'Failed to fetch news item' });
  }
});

export default router;
