import { 
  Heart, 
  User, 
  Settings, 
  CreditCard,
  Calendar,
  BarChart3,
  Palette,
  Crown,
  Clock,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { History } from './components/History';
import { PWAInstaller } from './components/PWAInstaller';
import { UpgradePrompt } from './components/UpgradePrompt';
import { BrandingCustomizer } from './components/BrandingCustomizer';
import { BrandingProvider } from './components/BrandingProvider';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { AuthScreen } from './components/AuthScreen';
import { EmailVerification } from './components/EmailVerification';
import { DisclaimerAcceptance } from './components/DisclaimerAcceptance';
import { SubscriptionManager } from './components/SubscriptionManager';
import { JournalEntry } from './components/JournalEntry';
import { ReviewEntry } from './components/ReviewEntry';
import { SuccessConfirmation } from './components/SuccessConfirmation';
import { LogoComponent } from './components/LogoComponent';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { secureStorage } from './services/SecureStorage';
import { Toaster } from './components/ui/sonner';

// 🔥 CACHE BUSTER - VERSION 2024-03-25-V4 🔥
console.log('🔥🔥🔥 APP.TSX VERSION: 2024-03-25-V4 🔥🔥🔥');

interface EmotionData {
  happiness: number;
  anxiety: number;
  sadness: number;
  anger: number;
  energy: number;
  overall: number;
}

type AppScreen = 'journal' | 'review' | 'success' | 'subscription' | 'profile' | 'analytics' | 'branding' | 'history';

function AppContent() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('journal');
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  useEffect(() => {
    console.log('🔴🔴🔴 APP.TSX USEEFFECT - USER CHANGED:', user);
    
    // Service worker registration - disabled for development
    // if ('serviceWorker' in navigator) {
    //   window.addEventListener('load', () => {
    //     navigator.serviceWorker.register('/sw.js')
    //       .then((registration) => {
    //         console.log('SW registered: ', registration);
    //       })
    //       .catch((registrationError) => {
    //         console.log('SW registration failed: ', registrationError);
    //       });
    // }

    // Load recent entries when user is authenticated
    if (user) {
      console.log('🔵 Loading recent entries for user:', user.email);
      loadRecentEntries();
    }
  }, [user]);

  const loadRecentEntries = async () => {
    if (!user) return;
    
    try {
      const entries = await secureStorage.getJournalEntries(user.id);
      setTotalEntries(entries.length);
      
      const recent = entries
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentEntries(recent);
    } catch (error) {
      console.error('Failed to load recent entries:', error);
    }
  };

  const handleEntryComplete = (data: EmotionData) => {
    setEmotionData(data);
    setCurrentScreen('review');
  };

  const handleSendToTherapist = async () => {
    if (!user || !emotionData) return;

    try {
      const entryId = await secureStorage.saveJournalEntry(user.id, {
        date: new Date().toISOString(),
        emotions: emotionData,
        sent: false
      });

      if (user.therapistEmail) {
        await secureStorage.sendToTherapist(user.id, entryId, user.therapistEmail);
      }

      await loadRecentEntries();
      setCurrentScreen('success');
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
  };

  const handleBackToEntry = () => {
    setCurrentScreen('journal');
  };

  const handleNewEntry = () => {
    setEmotionData(null);
    setCurrentScreen('journal');
  };

  const handleUpgradeClick = () => {
    setCurrentScreen('subscription');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDisclaimerAccept = () => {
    // Only set state - do NOT persist to localStorage
    // This ensures users must accept the disclaimer every time they log in
    setHasAcceptedDisclaimer(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* 🎯 EDIT THIS: Loading message */}
          <p className="text-gray-600">Preparing your wellness journey...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Show email verification screen if user hasn't verified their email
  if (user && !user.isVerified) {
    return <EmailVerification onVerified={() => {
      // Force reload to refresh user state
      window.location.reload();
    }} />;
  }

  // Show disclaimer acceptance screen if user hasn't accepted yet
  if (!hasAcceptedDisclaimer) {
    return <DisclaimerAcceptance onAccept={handleDisclaimerAccept} />;
  }

  // Check subscription status for premium features
  const hasActiveSubscription = user?.subscriptionStatus === 'active';
  const isPremiumUser = hasActiveSubscription && ['premium', 'family'].includes(user?.subscriptionPlan || '');

  // Calculate days since account creation for trial encouragement
  const daysSinceCreation = user?.createdAt 
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const showTrialEncouragement = !isPremiumUser && daysSinceCreation >= 3 && totalEntries >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="min-h-screen">
        {/* Header with Logo */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left side - Logo and App Name */}
            <div className="flex items-center gap-3">
              <LogoComponent 
                size="custom"
                customSize={{
                  icon: 'h-20 w-auto',
                  container: 'h-20'
                }}
                showText={false}
                layout="horizontal"
                variant="header"
                className="cursor-pointer"
                onClick={() => setCurrentScreen('journal')}
              />
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-3">
              {/* Subscription Badge */}
              <Badge 
                variant={hasActiveSubscription ? 'default' : 'secondary'}
                className="hidden sm:flex"
              >
                {isPremiumUser ? (
                  <div className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {user?.subscriptionPlan}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {/* 🎯 EDIT THIS: Free tier label */}
                    Free
                  </div>
                )}
              </Badge>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getInitials(user?.firstName || 'U', user?.lastName || 'U')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {/* 🎯 EDIT THIS: Logout button text */}
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Trial Encouragement Banner */}
        {showTrialEncouragement && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5" />
                <div>
                  {/* 🎯 EDIT THIS: Trial encouragement messages */}
                  <p className="font-medium text-sm">
                    Amazing! You've been journaling for {daysSinceCreation} days! 🎉
                  </p>
                  <p className="text-xs opacity-90">
                    Ready to unlock deeper insights and keep your entire wellness history?
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleUpgradeClick}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                {/* 🎯 EDIT THIS: Upgrade button text */}
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          
          <Tabs value={currentScreen} onValueChange={(value) => setCurrentScreen(value as AppScreen)}>
            {/* Navigation */}
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 max-w-2xl mx-auto mb-6">
              <TabsTrigger value="journal" className="flex items-center gap-1">
                <Heart className="h-4 w-4" style={{ color: '#1aa3d9' }} />
                {/* 🎯 EDIT THIS: Navigation labels */}
                <span className="hidden sm:inline">Journal</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" style={{ color: '#1aa3d9' }} />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" style={{ color: '#1aa3d9' }} />
                <span className="hidden sm:inline">Insights</span>
                {!isPremiumUser && <Badge className="ml-1 text-xs bg-purple-600">Pro</Badge>}
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1">
                <User className="h-4 w-4" style={{ color: '#1aa3d9' }} />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-1 hidden lg:flex">
                <Palette className="h-4 w-4" style={{ color: '#1aa3d9' }} />
                Customize
              </TabsTrigger>
            </TabsList>

            {/* Journal Entry Screen */}
            <TabsContent value="journal">
              {!isPremiumUser && currentScreen === 'journal' && (
                <UpgradePrompt onUpgradeClick={handleUpgradeClick} variant="header" className="mb-6" />
              )}
              {currentScreen === 'journal' && (
                <JournalEntry 
                  onComplete={handleEntryComplete} 
                  onUpgradeClick={handleUpgradeClick}
                />
              )}
              {currentScreen === 'review' && emotionData && (
                <ReviewEntry 
                  emotions={emotionData}
                  onSend={handleSendToTherapist}
                  onBack={handleBackToEntry}
                />
              )}
              {currentScreen === 'success' && (
                <SuccessConfirmation onNewEntry={handleNewEntry} />
              )}
              {!isPremiumUser && currentScreen === 'journal' && (
                <UpgradePrompt onUpgradeClick={handleUpgradeClick} variant="footer" className="mt-8" />
              )}
            </TabsContent>

            {/* Analytics/Insights */}
            <TabsContent value="analytics">
              {!isPremiumUser && (
                <UpgradePrompt onUpgradeClick={handleUpgradeClick} variant="header" className="mb-6" />
              )}
              <AnalyticsDashboard onUpgradeClick={handleUpgradeClick} />
              {!isPremiumUser && (
                <UpgradePrompt onUpgradeClick={handleUpgradeClick} variant="footer" className="mt-8" />
              )}
            </TabsContent>

            {/* Subscription Management */}
            <TabsContent value="subscription">
              <SubscriptionManager />
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  {/* 🎯 EDIT THIS: Profile page headings */}
                  <h2>Your Wellness Profile</h2>
                  <p className="text-muted-foreground">Manage your account and track your progress</p>
                </div>

                {/* Usage Stats for Free Users */}
                {!isPremiumUser && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-3">
                        <div className="flex justify-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-blue-900">{totalEntries}</div>
                            {/* 🎯 EDIT THIS: Stats labels */}
                            <div className="text-xs text-blue-700">Journal Entries</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-blue-900">{daysSinceCreation}</div>
                            <div className="text-xs text-blue-700">Days Active</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-blue-900">5</div>
                            <div className="text-xs text-blue-700">Days Visible</div>
                          </div>
                        </div>
                        <Button 
                          onClick={handleUpgradeClick}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          {/* 🎯 EDIT THIS: Upgrade button text */}
                          Unlock Complete History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                          {getInitials(user?.firstName || 'U', user?.lastName || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Badge className="mt-1">
                          {user?.subscriptionPlan} - {user?.subscriptionStatus}
                        </Badge>
                      </div>
                    </div>

                    {user?.therapistEmail && (
                      <div className="border-t pt-4">
                        {/* 🎯 EDIT THIS: Therapist section label */}
                        <h4 className="font-medium mb-2">Connected Therapist</h4>
                        <p className="text-sm text-muted-foreground">{user.therapistEmail}</p>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      {/* 🎯 EDIT THIS: Account creation label */}
                      <h4 className="font-medium mb-2">Member Since</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user?.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Branding Customizer */}
            <TabsContent value="branding">
              <BrandingCustomizer />
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              {!isPremiumUser && (
                <UpgradePrompt onUpgradeClick={handleUpgradeClick} variant="header" className="mb-6" />
              )}
              <History onUpgradeClick={handleUpgradeClick} />
              {!isPremiumUser && (
                <UpgradePrompt onUpgradeClick={handleUpgradeClick} variant="footer" className="mt-8" />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer with Logo (optional) */}
        <footer className="border-t border-gray-200 bg-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 text-center md:text-left">
                {/* 🎯 EDIT THIS: Footer copy */}
                <p>© 2024 Your Wellness Company. All rights reserved.</p>
                <p>HIPAA-compliant emotional wellness tracking</p>
              </div>
            </div>
            <DisclaimerFooter />
          </div>
        </footer>
      </div>

      {/* PWA Install Banner */}
      <PWAInstaller />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <BrandingProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </BrandingProvider>
  );
}