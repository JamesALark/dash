import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

interface FeedItem {
  id: string;
  type: 'task' | 'recommendation' | 'news';
  title: string;
  description?: string;
  url?: string;
  timestamp: string;
  metadata: {
    status?: string;
    priority?: string;
    dueDate?: string;
    recType?: string;
    recStatus?: string;
    sourceName?: string;
    read?: boolean;
  };
}

// GET unified feed
router.get('/', async (req, res) => {
  try {
    const feedItems: FeedItem[] = [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch high priority tasks or tasks due within 7 days
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { priority: 'high' },
          {
            dueDate: {
              not: null,
              lte: sevenDaysFromNow,
            },
          },
        ],
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Fetch recent recommendations (last 20)
    const recommendations = await prisma.recommendation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Fetch recent news items (last 20)
    const newsItems = await prisma.newsItem.findMany({
      include: { source: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });

    // Normalize tasks
    tasks.forEach((task) => {
      feedItems.push({
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description || undefined,
        timestamp: task.dueDate?.toISOString() || task.createdAt.toISOString(),
        metadata: {
          status: task.status,
          priority: task.priority || undefined,
          dueDate: task.dueDate?.toISOString(),
        },
      });
    });

    // Normalize recommendations
    recommendations.forEach((rec) => {
      feedItems.push({
        id: rec.id,
        type: 'recommendation',
        title: rec.title,
        description: rec.description || undefined,
        url: rec.url || undefined,
        timestamp: rec.createdAt.toISOString(),
        metadata: {
          recType: rec.type,
          recStatus: rec.status,
        },
      });
    });

    // Normalize news items
    newsItems.forEach((news) => {
      feedItems.push({
        id: news.id,
        type: 'news',
        title: news.title,
        description: news.description || undefined,
        url: news.url || undefined,
        timestamp: news.publishedAt?.toISOString() || news.createdAt.toISOString(),
        metadata: {
          sourceName: news.source.name,
          read: news.read,
        },
      });
    });

    // Sort by priority: tasks first, then recommendations, then news
    // Tasks: sort by dueDate ASC (earliest first), then createdAt DESC
    // Recommendations and News: sort by timestamp DESC (newest first)
    feedItems.sort((a, b) => {
      const typeOrder = { task: 0, recommendation: 1, news: 2 };
      const typeDiff = typeOrder[a.type] - typeOrder[b.type];
      if (typeDiff !== 0) return typeDiff;
      
      // For tasks, prioritize by dueDate (earliest first)
      if (a.type === 'task' && b.type === 'task') {
        const aDueDate = a.metadata.dueDate ? new Date(a.metadata.dueDate).getTime() : Infinity;
        const bDueDate = b.metadata.dueDate ? new Date(b.metadata.dueDate).getTime() : Infinity;
        if (aDueDate !== bDueDate) {
          return aDueDate - bDueDate; // ASC for due dates
        }
        // If both have same due date or no due date, sort by createdAt DESC
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      
      // For recommendations and news, sort by timestamp DESC (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    res.json(feedItems);
  } catch (error) {
    console.error('Failed to fetch feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

export default router;
