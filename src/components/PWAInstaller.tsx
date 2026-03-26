import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true ||
                          document.referrer.includes('android-app://');
    
    setIsInstalled(isAppInstalled);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Remember user dismissed for this session
    sessionStorage.setItem('installBannerDismissed', 'true');
  };

  // Don't show if already installed or user dismissed this session
  if (isInstalled || !showInstallBanner || sessionStorage.getItem('installBannerDismissed')) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-blue-200 bg-blue-50 shadow-lg md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-blue-900">
              Install Emotion Journal
            </p>
            <p className="text-xs text-blue-700">
              Add to your home screen for quick access and offline use
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstallClick}
                className="h-8 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="h-8 text-xs text-blue-700 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}