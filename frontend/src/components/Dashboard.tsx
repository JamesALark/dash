import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FeedRefreshProvider, useFeedRefresh } from '../contexts/FeedRefreshContext';
import TaskManager from './TaskManager';
import NewsFeed from './NewsFeed';
import Recommendations from './Recommendations';
import Feed from './Feed';
import MobileActionMenu from './MobileActionMenu';

type Tab = 'tasks' | 'news' | 'recommendations' | 'feed';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openRecommendationModal, setOpenRecommendationModal] = useState(false);
  const [openNewsSourceModal, setOpenNewsSourceModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { refreshFeed } = useFeedRefresh();

  const handleAddTask = () => {
    setOpenTaskModal(true);
    setMobileMenuOpen(false);
  };

  const handleAddRecommendation = () => {
    setOpenRecommendationModal(true);
    setMobileMenuOpen(false);
  };

  const handleAddNewsSource = () => {
    setOpenNewsSourceModal(true);
    setMobileMenuOpen(false);
  };

  const handleRefreshFeed = () => {
    refreshFeed();
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-lg">
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
      <div className="ml-0 md:ml-64 p-4 md:p-8">
        {/* Mobile: Always show Feed */}
        <div className="block md:hidden">
          <Feed />
        </div>
        
        {/* Always render components for modals - hide main content on mobile with hideContent prop */}
        <div className="block md:hidden">
          <TaskManager openCreateModal={openTaskModal} onModalClose={() => setOpenTaskModal(false)} hideContent={true} />
          <NewsFeed openCreateSourceModal={openNewsSourceModal} onModalClose={() => setOpenNewsSourceModal(false)} hideContent={true} />
          <Recommendations openCreateModal={openRecommendationModal} onModalClose={() => setOpenRecommendationModal(false)} hideContent={true} />
        </div>
        
        {/* Desktop: Show based on activeTab */}
        <div className="hidden md:block">
          {activeTab === 'tasks' && <TaskManager openCreateModal={openTaskModal} onModalClose={() => setOpenTaskModal(false)} />}
          {activeTab === 'news' && <NewsFeed openCreateSourceModal={openNewsSourceModal} onModalClose={() => setOpenNewsSourceModal(false)} />}
          {activeTab === 'recommendations' && <Recommendations openCreateModal={openRecommendationModal} onModalClose={() => setOpenRecommendationModal(false)} />}
          {activeTab === 'feed' && <Feed />}
        </div>
      </div>

      {/* Mobile FAB Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed bottom-4 right-4 md:hidden w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-200 z-30"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Mobile Action Menu */}
      <MobileActionMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onAddTask={handleAddTask}
        onAddRecommendation={handleAddRecommendation}
        onAddNewsSource={handleAddNewsSource}
        onRefreshFeed={handleRefreshFeed}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <FeedRefreshProvider>
      <DashboardContent />
    </FeedRefreshProvider>
  );
}
