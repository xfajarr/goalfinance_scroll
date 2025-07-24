import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    // Register service worker manually
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // console.log('SW registered: ', registration);
          setOfflineReady(true);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed: ', error);
        });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
    setShowUpdatePrompt(false);
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  // Show offline ready notification briefly
  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(() => {
        setOfflineReady(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady]);

  if (offlineReady) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">App ready in PWA</h3>
            <p className="text-sm text-green-700">
              Goal Finance is now available PWA!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">Update Available</h3>
          <p className="text-sm text-blue-700 mb-3">
            A new version of Goal Finance is available. Update now to get the latest features.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Update
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Later
            </Button>
          </div>
        </div>
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
          className="p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
