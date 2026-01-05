import cron from 'node-cron';
import { fetchNewsFromSources } from './newsService';

// Run every hour to fetch news updates
export function startNewsCronJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled news fetch...');
    try {
      await fetchNewsFromSources();
      console.log('News fetch completed successfully');
    } catch (error) {
      console.error('Error in scheduled news fetch:', error);
    }
  });
  console.log('News cron job started - will fetch news every hour');
}
