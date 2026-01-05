import { VercelRequest, VercelResponse } from '@vercel/node';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// One-time migration endpoint
// Call this once to set up your database: POST /api/migrate
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: Add a secret token for security
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.MIGRATE_SECRET || 'migrate-secret-change-me';
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Running database migrations...');
    
    // Change to backend directory and run migrations
    const { stdout, stderr } = await execAsync(
      'cd backend && npx prisma migrate deploy',
      {
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || '',
        },
      }
    );

    console.log('Migration output:', stdout);
    if (stderr) {
      console.error('Migration warnings:', stderr);
    }

    res.status(200).json({ 
      message: 'Migrations completed successfully',
      output: stdout 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      error: 'Migration failed', 
      details: error.message,
      output: error.stdout || '',
      errorOutput: error.stderr || ''
    });
  }
}
