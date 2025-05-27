import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Ctx = {
  loadingRecommendations: boolean;
  setLoadingRecommendations: (v: boolean) => void;
};

const SearchStatusContext = createContext<Ctx | undefined>(undefined);

export function SearchStatusProvider({ children }: { children: ReactNode }) {
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  return (
    <SearchStatusContext.Provider
      value={{ loadingRecommendations, setLoadingRecommendations }}
    >
      {children}
    </SearchStatusContext.Provider>
  );
}

export function useSearchStatus() {
  const ctx = useContext(SearchStatusContext);
  if (!ctx)
    throw new Error('useSearchStatus must be inside SearchStatusProvider');
  return ctx;
}
