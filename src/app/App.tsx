import React, { useState, useEffect } from 'react';
import mood2dayLogo from '../imports/Mood2Day_Logo_w_Mark_and_TypeV3.png';
import mood2dayIcon from '../imports/Artboard_1.png';
import { publicAnonKey } from './utils/supabase/info';
import { useAuth, AuthProvider } from './components/AuthProvider';
import { BrandingProvider } from './components/BrandingProvider';
import { AuthScreen } from './components/AuthScreen';
import { EmailVerification } from './components/EmailVerification';
import { PWAInstaller } from './components/PWAInstaller';
import { UpgradePrompt } from './components/UpgradePrompt';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BrandingCustomizer } from './components/BrandingCustomizer';
import { History } from './components/History';
import { Clock, Home, Calendar, BarChart3, User, Palette, LogOut, Crown } from 'lucide-react';
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
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { secureStorage } from './services/SecureStorage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { PageHeader } from './components/PageHeader';

// 🔥 CACHE BUSTER - VERSION 2024-03-25-V5 🔥
console.log('🔥🔥🔥 APP.TSX VERSION: 2024-03-25-V5 🔥🔥🔥');

// Add error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🔥 React Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.href = '/'}>
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const { user, isAuthenticated, logout, updateProfile, isLoading } = useAuth();

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://use.typekit.net/lnr0zcv.css?_=${Date.now()}`;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = mood2dayIcon;
    img.onload = () => {
      const size = 64;
      // image is landscape — extract centered square containing just the icon mark
      const srcSize = img.height * 0.84;
      const srcX = (img.width - srcSize) / 2;
      const srcY = (img.height - srcSize) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);
      const url = canvas.toDataURL('image/png');
      ['icon', 'apple-touch-icon'].forEach(rel => {
        const link = (document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement)
          || Object.assign(document.createElement('link'), { rel });
        link.href = url;
        document.head.appendChild(link);
      });
    };
  }, []);
  console.log('🎯🎯🎯 APP.TSX RENDER - Auth State:', { 
    user: user ? `${user.email} (${user.id})` : 'NULL',
    isAuthenticated, 
    isVerified: user?.isVerified,
    isLoading
  });
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('journal');
  const [currentTab, setCurrentTab] = useState<'journal' | 'history' | 'analytics' | 'profile' | 'branding'>('journal');
  const [journalStep, setJournalStep] = useState<'entry' | 'review' | 'success'>('entry');
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [lastSentTherapistEmail, setLastSentTherapistEmail] = useState<string>('');
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const stripeSyncAttempted = React.useRef(false);
  const [isEditingTherapist, setIsEditingTherapist] = useState(false);
  const [therapistEmailInput, setTherapistEmailInput] = useState('');
  const [therapistEmailError, setTherapistEmailError] = useState('');

  useEffect(() => {
    console.log('🔴🔴🔴 APP.TSX USEEFFECT - USER CHANGED:', user);

    // Reset journal flow state whenever the logged-in user changes (e.g. logout → new signup)
    // This prevents a previous user's in-progress or completed entry from showing to a new user
    setJournalStep('entry');
    setEmotionData(null);

    // Load recent entries when user is authenticated
    if (user) {
      console.log('🔵 Loading recent entries for user:', user.email);
      loadRecentEntries();
    }
  }, [user?.id]);

  // Check disclaimer acceptance per user
  useEffect(() => {
    if (user?.id) {
      setHasAcceptedDisclaimer(localStorage.getItem(`disclaimerAccepted_${user.id}`) === 'true');
    } else {
      setHasAcceptedDisclaimer(false);
    }
  }, [user?.id]);

  // After Stripe checkout: sync subscription once the user is loaded
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasStripeSuccess =
      urlParams.get('session_id') && urlParams.get('success') === 'true';

    // Wait until user is loaded and we haven't synced yet this session
    if (!hasStripeSuccess || !user?.email || stripeSyncAttempted.current) return;

    stripeSyncAttempted.current = true;
    setIsVerifyingSession(true);

    // Clean URL immediately so a refresh doesn't retrigger
    window.history.replaceState({}, '', '/');

    fetch(
      `https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/make-server-2538a5b0/sync-from-stripe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      }
    )
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && data.user) {
          if (updateProfile) await updateProfile(data.user);
          toast.success('🎉 Welcome to Premium! Your subscription is now active.', { duration: 4000 });
        } else {
          toast.error(data.error || 'Could not confirm subscription. Please contact support.', { duration: 6000 });
        }
      })
      .catch(() => {
        toast.error('Could not confirm subscription. Please contact support.', { duration: 6000 });
      })
      .finally(() => {
        setIsVerifyingSession(false);
      });
  }, [user?.email]); // Fires once user is loaded — ref guard prevents duplicate calls

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
    setJournalStep('review');
  };

  const handleSendToTherapist = async (therapistEmail: string) => {
    if (!user || !emotionData) return;

    try {
      const entryId = await secureStorage.saveJournalEntry(user.id, {
        date: new Date().toISOString(),
        emotions: emotionData,
        sent: false
      });

      if (therapistEmail) {
        await secureStorage.sendToTherapist(user.id, entryId, therapistEmail);
        setLastSentTherapistEmail(therapistEmail);
      }

      await loadRecentEntries();
      setJournalStep('success');
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
  };

  const handleBackToEntry = () => {
    setJournalStep('entry');
  };

  const handleNewEntry = () => {
    setEmotionData(null);
    setJournalStep('entry');
  };

  const handleUpgradeClick = () => {
    setCurrentScreen('subscription');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDisclaimerAccept = () => {
    if (user?.id) localStorage.setItem(`disclaimerAccepted_${user.id}`, 'true');
    setHasAcceptedDisclaimer(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEditTherapistEmail = () => {
    setTherapistEmailInput(user?.therapistEmail || '');
    setTherapistEmailError('');
    setIsEditingTherapist(true);
  };

  const handleSaveTherapistEmail = async () => {
    // Validate email if provided
    if (therapistEmailInput.trim() && !validateEmail(therapistEmailInput)) {
      setTherapistEmailError('Please enter a valid email address');
      return;
    }

    try {
      // Update profile with new therapist email (or empty to remove)
      await updateProfile({ therapistEmail: therapistEmailInput.trim() || undefined });
      
      setIsEditingTherapist(false);
      setTherapistEmailError('');
      
      if (therapistEmailInput.trim()) {
        toast.success('✅ Therapist email updated successfully!');
      } else {
        toast.success('✅ Therapist email removed');
      }
    } catch (error) {
      console.error('Failed to update therapist email:', error);
      toast.error('Failed to update therapist email. Please try again.');
    }
  };

  const handleCancelEditTherapist = () => {
    setIsEditingTherapist(false);
    setTherapistEmailInput('');
    setTherapistEmailError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to right, #f77642, #e5485b)' }}>
        <div className="text-center space-y-6">
          {/* 🎯 EDIT THIS: Loading message */}
          <p className="text-gray-600">Preparing your wellness journey...</p>
        </div>
      </div>
    );
  }

  // Show loading screen when verifying Stripe checkout session
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to right, #f77642, #e5485b)' }}>
        <div className="text-center space-y-6 p-8">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-2">Activating Your Subscription...</h2>
            <p className="text-purple-700">Please wait while we confirm your payment with Stripe</p>
            <p className="text-sm text-purple-600 mt-4">This usually takes just a few seconds</p>
          </div>
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
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(to right, #f77642, #e5485b)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="min-h-screen">
        {/* Header Banner */}
        <header
          style={{
            background: 'linear-gradient(to right, #3866e1, #70ced7)',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            borderBottom: '2px solid white',
            marginBottom: '-2px',
          }}
        >
          <div className="px-4 pt-3 pb-[20px] max-w-7xl mx-auto flex items-center justify-between">
            {/* Left side — wordmark only */}
            <div className="flex flex-col leading-tight cursor-pointer" style={{ position: 'relative', top: '15px' }} onClick={() => { setCurrentScreen('journal'); setJournalStep('entry'); setEmotionData(null); }}>
              <span className="font-bold tracking-wide text-white" style={{ fontFamily: 'bc-alphapipe, graphie, sans-serif', fontSize: '1.14rem' }}>Mood2Day</span>
              <span className="font-bold text-blue-100 opacity-80 tracking-wider" style={{ fontFamily: "'KoHo', sans-serif", fontSize: '0.71rem', position: 'relative', top: '-3px' }}>Daily Emotional Journal</span>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-3" style={{ position: 'relative', right: '5px', top: '15px' }}>
              {/* Subscription Badge */}
              <Badge
                className="hidden sm:flex border border-white/30 text-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                {isPremiumUser ? (
                  <div className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {user?.subscriptionPlan}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Free
                  </div>
                )}
              </Badge>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <Avatar
                  className="h-8 w-8 border border-white/40 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => { setCurrentScreen('profile'); setCurrentTab('profile'); }}
                >
                  <AvatarFallback style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    {getInitials(user?.firstName || 'U', user?.lastName || 'U')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:flex text-white hover:bg-white/20 border border-white/30"
                >
                  <LogOut className="h-4 w-4 mr-2" />
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
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 max-w-2xl mx-auto mb-6" style={{ fontFamily: 'graphie, sans-serif' }}>
              <TabsTrigger value="journal" className="flex items-center gap-1">
                <Home className="h-4 w-4" style={{ color: '#1aa3d9' }} />
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
              {!isPremiumUser && journalStep === 'entry' && (
                <UpgradePrompt onUpgradeClick={handleUpgradeClick} variant="header" className="mb-6" />
              )}
              {journalStep === 'entry' && (
                <JournalEntry 
                  onComplete={handleEntryComplete} 
                  onUpgradeClick={handleUpgradeClick}
                />
              )}
              {journalStep === 'review' && emotionData && (
                <ReviewEntry 
                  emotions={emotionData}
                  onSend={handleSendToTherapist}
                  onBack={handleBackToEntry}
                />
              )}
              {journalStep === 'success' && (
                <SuccessConfirmation 
                  onNewEntry={handleNewEntry} 
                  therapistEmail={lastSentTherapistEmail}
                />
              )}
              {!isPremiumUser && journalStep === 'entry' && (
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
                <PageHeader
                  headline="Your Wellness Profile"
                  subhead="Manage your account and track your progress"
                />

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

                    {/* Therapist Email Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Therapist Email</h4>
                        {!isEditingTherapist && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditTherapistEmail}
                          >
                            {user?.therapistEmail ? 'Edit' : 'Add'}
                          </Button>
                        )}
                      </div>
                      
                      {isEditingTherapist ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="therapist-email">Therapist Email Address</Label>
                            <Input
                              id="therapist-email"
                              type="email"
                              placeholder="therapist@example.com"
                              value={therapistEmailInput}
                              onChange={(e) => setTherapistEmailInput(e.target.value)}
                              className={therapistEmailError ? 'border-red-500' : ''}
                            />
                            {therapistEmailError && (
                              <p className="text-xs text-red-600">{therapistEmailError}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Journal entries can be shared with your therapist via email
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveTherapistEmail}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEditTherapist}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {user?.therapistEmail ? (
                            <p className="text-sm text-muted-foreground">{user.therapistEmail}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No therapist email configured. Add one to share journal entries.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Member Since</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user?.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <Button
                        variant="ghost"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
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
                <p>© 2024 ThatOne! Digital. All rights reserved.</p>
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
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
        <Toaster />
      </AuthProvider>
    </BrandingProvider>
  );
}