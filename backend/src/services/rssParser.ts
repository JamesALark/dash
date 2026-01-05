import Parser from 'rss-parser';

const parser = new Parser();

export interface RSSFeedItem {
  title: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

export async function parseRSSFeed(url: string): Promise<RSSFeedItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map((item) => ({
      title: item.title || '',
      description: item.contentSnippet || item.content || undefined,
      link: item.link || undefined,
      pubDate: item.pubDate || undefined,
    }));
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    throw error;
  }
}
