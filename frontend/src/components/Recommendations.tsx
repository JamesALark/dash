import { useState, useEffect } from 'react';
import { recommendationsApi } from '../services/api';
import { useFeedRefresh } from '../contexts/FeedRefreshContext';

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  status: string;
  createdAt: string;
}

interface RecommendationsProps {
  openCreateModal?: boolean;
  onModalClose?: () => void;
  hideContent?: boolean;
}

export default function Recommendations({ openCreateModal = false, onModalClose, hideContent = false }: RecommendationsProps = {}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);
  const [formData, setFormData] = useState({
    type: 'to watch',
    title: '',
    description: '',
    url: '',
    status: 'pending',
  });
  const [filter, setFilter] = useState<string>('all');
  const { refreshFeed } = useFeedRefresh();

  // Handle external modal trigger
  useEffect(() => {
    if (openCreateModal) {
      setEditingRec(null);
      setFormData({ type: 'to watch', title: '', description: '', url: '', status: 'pending' });
      setShowModal(true);
      // Reset the trigger after opening
      if (onModalClose) {
        setTimeout(() => onModalClose(), 100);
      }
    }
  }, [openCreateModal, onModalClose]);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await recommendationsApi.getAll();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRec) {
        await recommendationsApi.update(editingRec.id, formData);
      } else {
        await recommendationsApi.create(formData);
      }
      setShowModal(false);
      setEditingRec(null);
      setFormData({ type: 'to watch', title: '', description: '', url: '', status: 'pending' });
      if (onModalClose) onModalClose();
      loadRecommendations();
      refreshFeed();
    } catch (error) {
      console.error('Failed to save recommendation:', error);
    }
  };

  const handleEdit = (rec: Recommendation) => {
    setEditingRec(rec);
    setFormData({
      type: rec.type,
      title: rec.title,
      description: rec.description || '',
      url: rec.url || '',
      status: rec.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this recommendation?')) {
      try {
        await recommendationsApi.delete(id);
        loadRecommendations();
        refreshFeed();
      } catch (error) {
        console.error('Failed to delete recommendation:', error);
      }
    }
  };

  const handleToggleStatus = async (rec: Recommendation) => {
    try {
      await recommendationsApi.update(rec.id, {
        status: rec.status === 'completed' ? 'pending' : 'completed',
      });
      loadRecommendations();
      refreshFeed();
    } catch (error) {
      console.error('Failed to update recommendation:', error);
    }
  };

  const filteredRecs = filter === 'all'
    ? recommendations
    : filter === 'pending'
    ? recommendations.filter(r => r.status === 'pending')
    : filter === 'completed'
    ? recommendations.filter(r => r.status === 'completed')
    : recommendations.filter(r => r.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'to watch': return '📺';
      case 'to read': return '📚';
      default: return '⭐';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'to watch': return 'bg-purple-500/20 text-purple-300 dark:bg-purple-500/20 dark:text-purple-300';
      case 'to read': return 'bg-blue-500/20 text-blue-300 dark:bg-blue-500/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-slate-400">Loading recommendations...</div>;
  }

  return (
    <div>
      {!hideContent && (
        <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100 font-semibold">Recommendations</h2>
        <button
          onClick={() => {
            setEditingRec(null);
            setFormData({ type: 'to watch', title: '', description: '', url: '', status: 'pending' });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px]"
        >
          + Add Recommendation
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        {['to watch', 'to read'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600'
            }`}
          >
            {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="grid gap-4">
        {filteredRecs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-500">
            No recommendations found. Add your first recommendation!
          </div>
        ) : (
          filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 ${
                rec.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <span className="text-xl md:text-2xl">{getTypeIcon(rec.type)}</span>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-slate-100 flex-1 min-w-0">{rec.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(rec.type)} whitespace-nowrap`}>
                      {rec.type}
                    </span>
                    {rec.status === 'completed' && (
                      <span className="bg-green-500/20 dark:bg-green-500/20 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded whitespace-nowrap">
                        Completed
                      </span>
                    )}
                  </div>
                  {rec.description && (
                    <p className="text-gray-600 dark:text-slate-300 mb-3 break-words">{rec.description}</p>
                  )}
                  {rec.url && (
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors duration-200"
                    >
                      {rec.type === 'to watch' ? 'Watch →' : 
                       rec.type === 'to read' ? 'Read More →' : 
                       'View →'}
                    </a>
                  )}
                  <div className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                    Added {new Date(rec.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 md:ml-4 w-full md:w-auto">
                  <button
                    onClick={() => handleToggleStatus(rec)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 min-h-[44px] ${
                      rec.status === 'completed'
                        ? 'bg-yellow-500/20 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/30 dark:hover:bg-yellow-500/30'
                        : 'bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30 dark:hover:bg-green-500/30'
                    }`}
                  >
                    {rec.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                  </button>
                  <button
                    onClick={() => handleEdit(rec)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-2 text-sm transition-colors duration-200 min-h-[44px] rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-2 text-sm transition-colors duration-200 min-h-[44px] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-6 w-full max-w-[95vw] md:max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-slate-100">
              {editingRec ? 'Edit Recommendation' : 'New Recommendation'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 text-gray-900 dark:text-slate-100 transition-all duration-200"
                >
                  <option value="to watch">To Watch</option>
                  <option value="to read">To Read</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 transition-all duration-200"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 transition-all duration-200"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-100 transition-all duration-200"
                  placeholder="https://..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 text-gray-900 dark:text-slate-100 transition-all duration-200"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRec(null);
                    if (onModalClose) onModalClose();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all duration-200"
                >
                  {editingRec ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
