import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import TaskManager from './TaskManager';
import NewsFeed from './NewsFeed';
import Recommendations from './Recommendations';
import Feed from './Feed';

type Tab = 'tasks' | 'news' | 'recommendations' | 'feed';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Life OS</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Dashboard</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-100 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <nav className="mt-8">
          <button
            onClick={() => setActiveTab('feed')}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-all duration-200 ${
              activeTab === 'feed'
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-slate-100 border-l-4 border-blue-500'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="text-lg">📋</span>
            <span className="font-medium">Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-all duration-200 ${
              activeTab === 'tasks'
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-slate-100 border-l-4 border-blue-500'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="text-lg">✓</span>
            <span className="font-medium">Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-all duration-200 ${
              activeTab === 'news'
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-slate-100 border-l-4 border-blue-500'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="text-lg">📰</span>
            <span className="font-medium">News</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-all duration-200 ${
              activeTab === 'recommendations'
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-slate-100 border-l-4 border-blue-500'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="text-lg">⭐</span>
            <span className="font-medium">Recommendations</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'news' && <NewsFeed />}
        {activeTab === 'recommendations' && <Recommendations />}
        {activeTab === 'feed' && <Feed />}
      </div>
    </div>
  );
}
