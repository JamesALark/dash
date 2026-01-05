import { useState, useEffect, useCallback } from 'react';
import { feedApi, tasksApi, recommendationsApi, newsApi } from '../services/api';
import { useFeedRefresh } from '../contexts/FeedRefreshContext';

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

export default function Feed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { registerRefreshCallback } = useFeedRefresh();

  const loadFeed = useCallback(async () => {
    try {
      const response = await feedApi.getAll();
      setFeedItems(response.data);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    registerRefreshCallback(loadFeed);
  }, [registerRefreshCallback, loadFeed]);

  const handleTaskUpdate = async (id: string, status: string) => {
    try {
      await tasksApi.update(id, { status });
      loadFeed();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleRecommendationToggle = async (id: string, currentStatus: string) => {
    try {
      await recommendationsApi.update(id, {
        status: currentStatus === 'completed' ? 'pending' : 'completed',
      });
      loadFeed();
    } catch (error) {
      console.error('Failed to update recommendation:', error);
    }
  };

  const handleNewsMarkRead = async (id: string, read: boolean) => {
    try {
      await newsApi.markRead(id, read);
      loadFeed();
    } catch (error) {
      console.error('Failed to update news item:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return '✓';
      case 'recommendation': return '⭐';
      case 'news': return '📰';
      default: return '•';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-500/20 text-blue-300 dark:bg-blue-500/20 dark:text-blue-300';
      case 'recommendation': return 'bg-purple-500/20 text-purple-300 dark:bg-purple-500/20 dark:text-purple-300';
      case 'news': return 'bg-green-500/20 text-green-300 dark:bg-green-500/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done': return 'bg-green-500/20 text-green-300 dark:bg-green-500/20 dark:text-green-300';
      case 'completed': return 'bg-green-500/20 text-green-300 dark:bg-green-500/20 dark:text-green-300';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-slate-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const absDiffMs = Math.abs(diffMs);
    
    // Handle future dates
    if (diffMs < 0) {
      const diffDays = Math.ceil(absDiffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        return 'Tomorrow';
      } else {
        return `In ${diffDays} days`;
      }
    }
    
    // Handle past dates with granular formatting
    const diffSeconds = Math.floor(absDiffMs / 1000);
    const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
    const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    
    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-slate-400">Loading feed...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 font-semibold">Unified Feed</h2>
        <button
          onClick={loadFeed}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Refresh
        </button>
      </div>

      {/* Feed Items */}
      <div className="grid gap-4">
        {feedItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-500">
            No feed items found. Create some tasks, recommendations, or add news sources!
          </div>
        ) : (
          feedItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 ${
                item.type === 'task' && item.metadata.priority === 'high' ? 'border-l-4 border-red-500' : ''
              } ${
                item.type === 'news' && !item.metadata.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">{item.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(item.type)}`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    {item.type === 'task' && item.metadata.priority === 'high' && (
                      <span className="bg-red-500/20 dark:bg-red-500/20 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded">
                        High Priority
                      </span>
                    )}
                    {item.type === 'news' && !item.metadata.read && (
                      <span className="bg-blue-500/20 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">
                        New
                      </span>
                    )}
                    {item.type === 'recommendation' && item.metadata.recStatus === 'completed' && (
                      <span className="bg-green-500/20 dark:bg-green-500/20 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                        Completed
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-gray-600 dark:text-slate-300 mb-3">{item.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-slate-400 mb-2">
                    {item.type === 'task' && (
                      <>
                        <span className={`px-2 py-1 rounded ${getStatusColor(item.metadata.status)}`}>
                          {item.metadata.status?.replace('-', ' ') || 'todo'}
                        </span>
                        {item.metadata.priority && (
                          <span className={getPriorityColor(item.metadata.priority)}>
                            Priority: {item.metadata.priority}
                          </span>
                        )}
                        {item.metadata.dueDate && (
                          <span>
                            Due: {new Date(item.metadata.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </>
                    )}
                    {item.type === 'recommendation' && (
                      <>
                        <span className={`px-2 py-1 rounded ${getStatusColor(item.metadata.recStatus)}`}>
                          {item.metadata.recStatus || 'pending'}
                        </span>
                        {item.metadata.recType && (
                          <span className="text-gray-500 dark:text-slate-400">
                            {item.metadata.recType}
                          </span>
                        )}
                      </>
                    )}
                    {item.type === 'news' && (
                      <>
                        {item.metadata.sourceName && (
                          <span>{item.metadata.sourceName}</span>
                        )}
                      </>
                    )}
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mt-2 inline-block transition-colors duration-200"
                    >
                      {item.type === 'task' ? 'View Task →' :
                       item.type === 'recommendation' ? (item.metadata.recType === 'to watch' ? 'Watch →' : 'Read More →') :
                       'Read more →'}
                    </a>
                  )}
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {item.type === 'task' && (
                    <>
                      {item.metadata.status !== 'done' && (
                        <button
                          onClick={() => handleTaskUpdate(item.id, 'done')}
                          className="bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30 dark:hover:bg-green-500/30 px-3 py-1 rounded-lg text-sm transition-all duration-200"
                        >
                          Mark Done
                        </button>
                      )}
                      {item.metadata.status === 'done' && (
                        <button
                          onClick={() => handleTaskUpdate(item.id, 'todo')}
                          className="bg-yellow-500/20 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/30 dark:hover:bg-yellow-500/30 px-3 py-1 rounded-lg text-sm transition-all duration-200"
                        >
                          Mark Todo
                        </button>
                      )}
                    </>
                  )}
                  {item.type === 'recommendation' && (
                    <button
                      onClick={() => handleRecommendationToggle(item.id, item.metadata.recStatus || 'pending')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                        item.metadata.recStatus === 'completed'
                          ? 'bg-yellow-500/20 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/30 dark:hover:bg-yellow-500/30'
                          : 'bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30 dark:hover:bg-green-500/30'
                      }`}
                    >
                      {item.metadata.recStatus === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                    </button>
                  )}
                  {item.type === 'news' && (
                    <button
                      onClick={() => handleNewsMarkRead(item.id, !item.metadata.read)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                        item.metadata.read
                          ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                          : 'bg-blue-500/20 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 dark:hover:bg-blue-500/30'
                      }`}
                    >
                      {item.metadata.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
