import { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchNewsFromSources } from '../../src/services/newsService';

// Vercel Cron job endpoint for refreshing news
// This endpoint is called by Vercel Cron based on the schedule in vercel.json
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify the request is from Vercel Cron (optional security check)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Running scheduled news fetch via Vercel Cron...');
    await fetchNewsFromSources();
    console.log('News fetch completed successfully');
    res.status(200).json({ message: 'News refreshed successfully' });
  } catch (error) {
    console.error('Error in scheduled news fetch:', error);
    res.status(500).json({ error: 'Failed to refresh news', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}
