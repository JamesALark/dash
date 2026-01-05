import { PrismaClient } from '../generated/prisma/client';
import { parseRSSFeed } from './rssParser';

const prisma = new PrismaClient();

export async function fetchNewsFromSources() {
  const sources = await prisma.newsSource.findMany({
    where: { enabled: true },
  });

  for (const source of sources) {
    try {
      if (source.type === 'rss' && source.url) {
        const items = await parseRSSFeed(source.url);
        
        for (const item of items) {
          // Check if news item already exists
          const existing = await prisma.newsItem.findFirst({
            where: {
              sourceId: source.id,
              url: item.link || '',
            },
          });

          if (!existing && item.link) {
            await prisma.newsItem.create({
              data: {
                sourceId: source.id,
                title: item.title,
                description: item.description,
                url: item.link,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              },
            });
          }
        }
      } else if (source.type === 'newsapi') {
        // News API integration would go here
        // For now, we'll skip it as it requires API key configuration
        console.log('News API integration not yet implemented');
      }
    } catch (error) {
      console.error(`Error fetching news from source ${source.name}:`, error);
    }
  }
}

export async function fetchNewsFromNewsAPI(query?: string) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error('NEWS_API_KEY not configured');
  }

  const url = query
    ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}`
    : `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json() as {
      status?: string;
      articles?: Array<{
        title: string;
        description?: string;
        url?: string;
        publishedAt?: string;
      }>;
    };

    if (data.status === 'ok' && data.articles) {
      return data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching from News API:', error);
    throw error;
  }
}
