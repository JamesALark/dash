import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRoutes from './routes/tasks';
import recommendationsRoutes from './routes/recommendations';
import newsRoutes from './routes/news';
import feedRoutes from './routes/feed';
import { startNewsCronJob } from './services/cronJobs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', tasksRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/feed', feedRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export app for serverless functions (Vercel)
export default app;

// Only start server if not in serverless environment
// In serverless (Vercel), cron jobs are handled by Vercel Cron
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Start background job to fetch news periodically (only in local/dev environment)
    startNewsCronJob();
  });
}
