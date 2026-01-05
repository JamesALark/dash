import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// GET all recommendations
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const recommendations = await prisma.recommendation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(recommendations);
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendations',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// GET recommendation by ID
router.get('/:id', async (req, res) => {
  try {
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: req.params.id },
    });
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.json(recommendation);
  } catch (error) {
    console.error('Failed to fetch recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendation',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// POST create new recommendation
router.post('/', async (req, res) => {
  try {
    const { type, title, description, url, status } = req.body;
    const recommendation = await prisma.recommendation.create({
      data: {
        type,
        title,
        description,
        url,
        status: status || 'pending',
      },
    });
    res.status(201).json(recommendation);
  } catch (error) {
    console.error('Failed to create recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to create recommendation',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// PUT update recommendation
router.put('/:id', async (req, res) => {
  try {
    const { type, title, description, url, status } = req.body;
    const recommendation = await prisma.recommendation.update({
      where: { id: req.params.id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(url !== undefined && { url }),
        ...(status && { status }),
      },
    });
    res.json(recommendation);
  } catch (error) {
    console.error('Failed to update recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to update recommendation',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// DELETE recommendation
router.delete('/:id', async (req, res) => {
  try {
    await prisma.recommendation.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to delete recommendation',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

export default router;
