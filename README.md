# Life OS Dashboard

A comprehensive web-based dashboard for managing tasks, news, and recommendations.

## Features

- **Task Management**: Create, update, and track tasks with priorities and due dates
- **News Feed**: Aggregate news from RSS feeds and News API
- **Recommendations**: Track movies, YouTube videos, and books you want to check out

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Prisma ORM
- **News**: RSS parser + News API integration

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Frontend
cd ../frontend
npm install
```

### Configuration

1. Copy `.env.example` to `.env` in the backend directory:
```bash
cd backend
cp .env.example .env
```

2. (Optional) Add your News API key to `backend/.env`:
   - Get a free API key from [News API](https://newsapi.org/)

3. Copy `.env.example` to `.env` in the frontend directory:
```bash
cd frontend
cp .env.example .env
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server (in a new terminal):
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

## Usage

### Tasks
- Create tasks with titles, descriptions, priorities, and due dates
- Filter tasks by status (todo, in-progress, done)
- Update task status and details
- Delete tasks when completed

### News
- Add RSS feed sources by providing a name and URL
- Click "Refresh News" to fetch the latest articles
- Mark articles as read/unread
- Filter news by source or read status

### Recommendations
- Add recommendations for movies, YouTube videos, or books
- Filter by type or status (pending/completed)
- Mark items as completed when you've watched/read them
- Add URLs to link directly to the content

## Project Structure

```
life-os-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
└── README.md
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Recommendations
- `GET /api/recommendations` - Get all recommendations (supports ?type= and ?status= query params)
- `POST /api/recommendations` - Create a recommendation
- `PUT /api/recommendations/:id` - Update a recommendation
- `DELETE /api/recommendations/:id` - Delete a recommendation

### News
- `GET /api/news` - Get all news items (supports ?sourceId= and ?read= query params)
- `POST /api/news/refresh` - Refresh news from all sources
- `PUT /api/news/:id/read` - Mark news item as read/unread
- `GET /api/news/sources` - Get all news sources
- `POST /api/news/sources` - Add a news source
- `DELETE /api/news/sources/:id` - Delete a news source

## Development

### Backend
- Run migrations: `npm run prisma:migrate`
- Open Prisma Studio: `npm run prisma:studio`
- Build: `npm run build`
- Start production: `npm start`

### Frontend
- Build: `npm run build`
- Preview production build: `npm run preview`

## License

ISC
