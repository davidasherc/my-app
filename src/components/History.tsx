import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { secureStorage } from '../services/SecureStorage';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calendar,
  Crown,
  Lock,
  TrendingUp,
  TrendingDown,
  Smile,
  Frown,
  Meh,
  Clock
} from 'lucide-react';

interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  emotions: {
    happiness: number;
    anxiety: number;
    sadness: number;
    anger: number;
    energy: number;
    overall: number;
  };
  notes?: string;
  sent: boolean;
  sentAt?: string;
  therapistEmail?: string;
  createdAt: string;
  updatedAt: string;
}

interface HistoryProps {
  onUpgradeClick: () => void;
}

type TimeRange = '5days' | 'week' | 'month';

export function History({ onUpgradeClick }: HistoryProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('5days');

  // Check subscription status
  const hasActiveSubscription = user?.subscriptionStatus === 'active';
  const isPremiumUser = hasActiveSubscription && ['premium', 'family'].includes(user?.subscriptionPlan || '');

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const allEntries = await secureStorage.getJournalEntries(user.id);
      const sortedEntries = allEntries.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredEntries = (range: TimeRange): JournalEntry[] => {
    const now = new Date();
    const cutoffDays = range === '5days' ? 5 : range === 'week' ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - (cutoffDays * 24 * 60 * 60 * 1000));
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= cutoffDate;
    });
  };

  const filteredEntries = getFilteredEntries(selectedRange);

  const getEmotionIcon = (overall: number) => {
    if (overall >= 7) return <Smile className="h-5 w-5 text-green-500" />;
    if (overall >= 4) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const getEmotionLabel = (overall: number) => {
    if (overall >= 7) return 'Positive';
    if (overall >= 4) return 'Neutral';
    return 'Challenging';
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleRangeChange = (range: TimeRange) => {
    // If user is not premium and tries to access beyond 5 days, show upgrade
    if (!isPremiumUser && range !== '5days') {
      onUpgradeClick();
      return;
    }
    setSelectedRange(range);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Calendar className="h-12 w-12 mx-auto text-blue-500" />
          {/* 🎯 EDIT THIS: Loading message */}
          <p className="text-muted-foreground">Loading your journey history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-8 w-8 text-blue-500" />
          {/* 🎯 EDIT THIS: Page heading */}
          <h2>Your Wellness History</h2>
        </div>
        {/* 🎯 EDIT THIS: Page description */}
        <p className="text-muted-foreground">
          Track your emotional journey over time
        </p>
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {!isPremiumUser && (
        <Alert className="border-purple-200 bg-purple-50">
          <Crown className="h-4 w-4 text-purple-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              {/* 🎯 EDIT THIS: Upgrade prompt message */}
              <p className="text-sm font-medium text-purple-900">
                Free users can view the last 5 days of history
              </p>
              <p className="text-xs text-purple-700">
                Upgrade to Premium to unlock unlimited history and advanced insights
              </p>
            </div>
            <Button 
              size="sm" 
              onClick={onUpgradeClick}
              className="bg-purple-600 hover:bg-purple-700 ml-4"
            >
              <Crown className="h-4 w-4 mr-1" />
              {/* 🎯 EDIT THIS: Upgrade button text */}
              Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Time Range Selection */}
      <Tabs value={selectedRange} onValueChange={(value) => handleRangeChange(value as TimeRange)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="5days">
            {/* 🎯 EDIT THIS: Time range labels */}
            Last 5 Days
          </TabsTrigger>
          <TabsTrigger 
            value="week" 
            disabled={!isPremiumUser}
            className={`relative ${!isPremiumUser ? 'opacity-60' : ''}`}
            style={!isPremiumUser ? { filter: 'grayscale(100%)' } : undefined}
          >
            Last Week
            {!isPremiumUser && (
              <Lock className="h-3 w-3 ml-1 absolute top-2 right-2 text-gray-400" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="month" 
            disabled={!isPremiumUser}
            className={`relative ${!isPremiumUser ? 'opacity-60' : ''}`}
            style={!isPremiumUser ? { filter: 'grayscale(100%)' } : undefined}
          >
            Last Month
            {!isPremiumUser && (
              <Lock className="h-3 w-3 ml-1 absolute top-2 right-2 text-gray-400" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedRange} className="space-y-4 mt-6">
          {/* Summary Stats */}
          {filteredEntries.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-blue-900">
                      {filteredEntries.length}
                    </div>
                    {/* 🎯 EDIT THIS: Stats labels */}
                    <div className="text-xs text-blue-700">Total Entries</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-900">
                      {(filteredEntries.reduce((sum, e) => sum + e.emotions.overall, 0) / filteredEntries.length).toFixed(1)}
                    </div>
                    <div className="text-xs text-blue-700">Avg Mood</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-900">
                      {Math.max(...filteredEntries.map(e => e.emotions.overall)).toFixed(1)}
                    </div>
                    <div className="text-xs text-blue-700">Best Day</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-900">
                      {filteredEntries.filter(e => e.sent).length}
                    </div>
                    <div className="text-xs text-blue-700">Shared</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Entries List */}
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                {/* 🎯 EDIT THIS: Empty state message */}
                <p className="text-muted-foreground">No entries found for this time period</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start journaling to track your emotional wellness
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry, index) => {
                const previousEntry = filteredEntries[index + 1];
                const trend = previousEntry 
                  ? getTrendIndicator(entry.emotions.overall, previousEntry.emotions.overall)
                  : null;

                return (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getEmotionIcon(entry.emotions.overall)}
                          <div>
                            <CardTitle className="text-base">
                              {formatDate(entry.createdAt)}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {trend}
                          <Badge variant={entry.emotions.overall >= 7 ? 'default' : 'secondary'}>
                            {getEmotionLabel(entry.emotions.overall)}
                          </Badge>
                          {entry.sent && (
                            <Badge variant="outline" className="text-xs">
                              {/* 🎯 EDIT THIS: Shared badge label */}
                              Shared
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          {/* 🎯 EDIT THIS: Emotion labels */}
                          <span className="text-muted-foreground">Happiness:</span>
                          <span className="ml-2 font-medium">{entry.emotions.happiness}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Anxiety:</span>
                          <span className="ml-2 font-medium">{entry.emotions.anxiety}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Energy:</span>
                          <span className="ml-2 font-medium">{entry.emotions.energy}/10</span>
                        </div>
                        {!isPremiumUser ? (
                          <div className="col-span-2 md:col-span-3 flex justify-center pt-2 pb-1">
                            <Button 
                              onClick={onUpgradeClick}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Crown className="h-3 w-3 mr-2" />
                              {/* 🎯 EDIT THIS: Inline upgrade button text */}
                              Upgrade for Premium Emotions
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="text-muted-foreground">Sadness:</span>
                              <span className="ml-2 font-medium">{entry.emotions.sadness}/10</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Anger:</span>
                              <span className="ml-2 font-medium">{entry.emotions.anger}/10</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Overall:</span>
                              <span className="ml-2 font-medium">{entry.emotions.overall}/10</span>
                            </div>
                          </>
                        )}
                      </div>
                      {entry.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Locked Content Teaser for Free Users */}
          {!isPremiumUser && selectedRange === '5days' && entries.length > filteredEntries.length && (
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="pt-8 pb-8 text-center">
                <Lock className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                {/* 🎯 EDIT THIS: Locked content message */}
                <h3 className="font-semibold text-purple-900 mb-2">
                  {entries.length - filteredEntries.length} More Entries Available
                </h3>
                <p className="text-sm text-purple-700 mb-4">
                  Unlock your complete wellness history and advanced insights
                </p>
                <Button 
                  onClick={onUpgradeClick}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}