import { createContext, useContext, useRef, useCallback, ReactNode } from 'react';

interface FeedRefreshContextType {
  refreshFeed: () => void;
  registerRefreshCallback: (callback: () => void) => void;
}

const FeedRefreshContext = createContext<FeedRefreshContextType | undefined>(undefined);

export function FeedRefreshProvider({ children }: { children: ReactNode }) {
  const refreshCallbackRef = useRef<(() => void) | null>(null);

  const registerRefreshCallback = useCallback((callback: () => void) => {
    refreshCallbackRef.current = callback;
  }, []);

  const refreshFeed = useCallback(() => {
    if (refreshCallbackRef.current) {
      refreshCallbackRef.current();
    }
  }, []);

  return (
    <FeedRefreshContext.Provider value={{ refreshFeed, registerRefreshCallback }}>
      {children}
    </FeedRefreshContext.Provider>
  );
}

export function useFeedRefresh() {
  const context = useContext(FeedRefreshContext);
  if (context === undefined) {
    throw new Error('useFeedRefresh must be used within a FeedRefreshProvider');
  }
  return context;
}
