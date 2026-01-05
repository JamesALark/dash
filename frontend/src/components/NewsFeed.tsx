import { useState, useEffect } from 'react';
import { newsApi } from '../services/api';

interface NewsItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  read: boolean;
  source: {
    id: string;
    name: string;
    type: string;
  };
}

interface NewsSource {
  id: string;
  name: string;
  url?: string;
  type: string;
  enabled: boolean;
  createdAt?: string;
}

export default function NewsFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showManageFeedsModal, setShowManageFeedsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<NewsSource | null>(null);
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [sourceForm, setSourceForm] = useState({
    name: '',
    url: '',
    type: 'rss',
  });
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadNews();
    loadSources();
  }, []);

  const loadNews = async () => {
    try {
      const response = await newsApi.getAll();
      setNewsItems(response.data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSources = async () => {
    try {
      const response = await newsApi.getSources();
      console.log('Sources loaded:', response.data);
      setSources(response.data || []);
    } catch (error: any) {
      console.error('Failed to load sources:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set empty array on error to prevent UI issues
      setSources([]);
    }
  };

  const handleRefresh = async () => {
    try {
      await newsApi.refresh();
      loadNews();
    } catch (error) {
      console.error('Failed to refresh news:', error);
    }
  };

  const handleMarkRead = async (id: string, read: boolean) => {
    try {
      await newsApi.markRead(id, read);
      loadNews();
    } catch (error) {
      console.error('Failed to update news item:', error);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await newsApi.createSource(sourceForm);
      setShowSourceModal(false);
      setSourceForm({ name: '', url: '', type: 'rss' });
      loadSources();
      loadNews();
    } catch (error) {
      console.error('Failed to add source:', error);
    }
  };

  const handleDeleteClick = (source: NewsSource) => {
    setSourceToDelete(source);
    setShowDeleteConfirmModal(true);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  const handleDeleteConfirm = async () => {
    if (!sourceToDelete) return;
    
    setDeletingSourceId(sourceToDelete.id);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      await newsApi.deleteSource(sourceToDelete.id);
      setDeleteSuccess(true);
      setTimeout(() => {
        setShowDeleteConfirmModal(false);
        setSourceToDelete(null);
        setDeletingSourceId(null);
        setDeleteSuccess(false);
        loadSources();
        loadNews();
      }, 1000);
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || 'Failed to delete news source');
      setDeletingSourceId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmModal(false);
    setSourceToDelete(null);
    setDeleteError(null);
    setDeleteSuccess(false);
    setDeletingSourceId(null);
  };

  const handleOpenManageFeeds = () => {
    loadSources(); // Reload sources to ensure we have the latest data
    setShowManageFeedsModal(true);
  };

  const filteredNews = filter === 'all'
    ? newsItems
    : filter === 'unread'
    ? newsItems.filter(item => !item.read)
    : newsItems.filter(item => item.source.id === filter);

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-slate-400">Loading news...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 font-semibold">News Feed</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            Refresh News
          </button>
          <button
            onClick={handleOpenManageFeeds}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            Manage Feeds
          </button>
          <button
            onClick={() => setShowSourceModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            + Add Source
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600'
          }`}
        >
          Unread
        </button>
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => setFilter(source.id)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              filter === source.id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600'
            }`}
          >
            {source.name}
          </button>
        ))}
      </div>

      {/* News Items */}
      <div className="grid gap-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-500">
            No news items found. Add a news source and refresh!
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 ${
                !item.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">{item.title}</h3>
                    {!item.read && (
                      <span className="bg-blue-500/20 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">
                        New
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-gray-600 dark:text-slate-300 mb-3">{item.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-slate-400">
                    <span>{item.source.name}</span>
                    {item.publishedAt && (
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mt-2 inline-block transition-colors duration-200"
                    >
                      Read more →
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleMarkRead(item.id, !item.read)}
                  className={`ml-4 px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                    item.read
                      ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                      : 'bg-blue-500/20 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 dark:hover:bg-blue-500/30'
                  }`}
                >
                  {item.read ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manage Feeds Modal */}
      {showManageFeedsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Manage News Feeds</h3>
              <button
                onClick={() => setShowManageFeedsModal(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {sources.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                <p className="mb-4">No news feeds added yet.</p>
                <button
                  onClick={() => {
                    setShowManageFeedsModal(false);
                    setShowSourceModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Add Your First Feed
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="bg-gray-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                            {source.name}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              source.enabled
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {source.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              source.type === 'rss'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                            }`}
                          >
                            {source.type.toUpperCase()}
                          </span>
                        </div>
                        {source.url && (
                          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2 break-all">
                            <span className="font-medium">URL:</span> {source.url}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-slate-500">
                          Created: {new Date(source.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(source)}
                        disabled={deletingSourceId === source.id}
                        className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm"
                      >
                        {deletingSourceId === source.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && sourceToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            {deleteSuccess ? (
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-slate-100">
                  Feed Deleted Successfully
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  The feed "{sourceToDelete.name}" has been removed.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-slate-100">
                  Delete News Feed?
                </h3>
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">
                    <span className="font-semibold">Feed Name:</span> {sourceToDelete.name}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">
                    <span className="font-semibold">Type:</span> {sourceToDelete.type.toUpperCase()}
                  </p>
                  {sourceToDelete.url && (
                    <p className="text-sm text-gray-700 dark:text-slate-300 mb-2 break-all">
                      <span className="font-semibold">URL:</span> {sourceToDelete.url}
                    </p>
                  )}
                </div>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                  This action cannot be undone. All news items from this feed will also be deleted.
                </p>
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">{deleteError}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    disabled={deletingSourceId !== null}
                    className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={deletingSourceId !== null}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                  >
                    {deletingSourceId !== null ? 'Deleting...' : 'Delete Feed'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Source Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-slate-100">Add News Source</h3>
            <form onSubmit={handleAddSource}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={sourceForm.name}
                  onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 transition-all duration-200"
                  placeholder="e.g., TechCrunch"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={sourceForm.type}
                  onChange={(e) => setSourceForm({ ...sourceForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 text-gray-900 dark:text-slate-100 transition-all duration-200"
                >
                  <option value="rss">RSS Feed</option>
                  <option value="newsapi">News API</option>
                </select>
              </div>
              {sourceForm.type === 'rss' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    RSS Feed URL
                  </label>
                  <input
                    type="url"
                    required={sourceForm.type === 'rss'}
                    value={sourceForm.url}
                    onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 transition-all duration-200"
                    placeholder="https://example.com/feed.xml"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSourceModal(false);
                    setSourceForm({ name: '', url: '', type: 'rss' });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all duration-200"
                >
                  Add Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
