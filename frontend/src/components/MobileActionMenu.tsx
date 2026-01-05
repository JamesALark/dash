interface MobileActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: () => void;
  onAddRecommendation: () => void;
  onAddNewsSource: () => void;
  onRefreshFeed: () => void;
}

export default function MobileActionMenu({
  isOpen,
  onClose,
  onAddTask,
  onAddRecommendation,
  onAddNewsSource,
  onRefreshFeed,
}: MobileActionMenuProps) {
  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-3xl shadow-2xl z-50 md:hidden transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '60vh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-6 pb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Quick Actions</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors duration-200"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 100px)' }}>
          <div className="grid grid-cols-2 gap-4">
            {/* Add Task */}
            <button
              onClick={() => handleAction(onAddTask)}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 min-h-[100px]"
            >
              <span className="text-4xl mb-2">➕</span>
              <span className="text-sm font-medium text-gray-800 dark:text-slate-100">Add Task</span>
            </button>

            {/* Add Recommendation */}
            <button
              onClick={() => handleAction(onAddRecommendation)}
              className="flex flex-col items-center justify-center p-6 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-all duration-200 min-h-[100px]"
            >
              <span className="text-4xl mb-2">⭐</span>
              <span className="text-sm font-medium text-gray-800 dark:text-slate-100">Add Recommendation</span>
            </button>

            {/* Add News Source */}
            <button
              onClick={() => handleAction(onAddNewsSource)}
              className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all duration-200 min-h-[100px]"
            >
              <span className="text-4xl mb-2">📰</span>
              <span className="text-sm font-medium text-gray-800 dark:text-slate-100">Add News Source</span>
            </button>

            {/* Refresh Feed */}
            <button
              onClick={() => handleAction(onRefreshFeed)}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 min-h-[100px]"
            >
              <span className="text-4xl mb-2">🔄</span>
              <span className="text-sm font-medium text-gray-800 dark:text-slate-100">Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
