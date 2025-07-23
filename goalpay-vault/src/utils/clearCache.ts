/**
 * Utility to clear all cached data and force refresh
 */
export const clearAllCache = () => {
  // Clear localStorage
  try {
    localStorage.clear();
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear();
  } catch (error) {
    console.warn('Failed to clear sessionStorage:', error);
  }

  // Clear any wagmi cache if available
  try {
    // This will be handled by the page reload
    console.log('Clearing wagmi cache...');
  } catch (error) {
    console.warn('Failed to clear wagmi cache:', error);
  }

  // Force page reload to clear all in-memory cache
  window.location.reload();
};

/**
 * Clear cache for specific vault data
 */
export const clearVaultCache = (vaultId: string | number) => {
  try {
    // Remove specific vault data from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(`vault-${vaultId}`) || key.includes(`vault_${vaultId}`)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log(`Cleared cache for vault ${vaultId}`);
  } catch (error) {
    console.warn('Failed to clear vault cache:', error);
  }
};
