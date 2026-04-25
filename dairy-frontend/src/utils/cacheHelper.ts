// Cache helper utilities to prevent unnecessary API calls

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const shouldFetchData = (
  data: any[] | any, 
  lastFetched: number | null, 
  isLoading: boolean = false
): boolean => {
  // Don't fetch if currently loading
  if (isLoading) {
    return false;
  }

  // If we have no recent successful fetch, we MUST fetch
  if (!lastFetched) {
    return true;
  }

  // If we have data, check if it's stale
  // Even if data is empty, if we just fetched it successfully (lastFetched exists), 
  // we count it as a valid empty state until the cache expires.
  if (Date.now() - lastFetched > CACHE_DURATION) {
    return true;
  }

  // If we're here, we have a recent (non-stale) fetch. 
  // We only fetch again if we LITERALLY have no data state at all (null/undefined)
  // but an empty array [] is a valid fetched state.
  if (data === null || data === undefined) {
    return true;
  }

  return false;
};

export const shouldFetchUserData = (
  data: any[], 
  lastFetched: number | null, 
  isLoading: boolean = false
): boolean => {
  return shouldFetchData(data, lastFetched, isLoading);
};

export const shouldFetchSettings = (
  data: any, 
  lastFetched: number | null, 
  isLoading: boolean = false
): boolean => {
  return shouldFetchData(data, lastFetched, isLoading);
};

// Session storage helpers for temporary caching
export const setSessionCache = (key: string, data: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to set session cache:', error);
  }
};

export const getSessionCache = (key: string, maxAge: number = CACHE_DURATION) => {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - timestamp > maxAge) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to get session cache:', error);
    return null;
  }
};

export const clearSessionCache = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear session cache:', error);
  }
};
