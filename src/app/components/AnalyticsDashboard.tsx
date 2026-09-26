import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  BarChart3, 
  Crown, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Zap,
  Heart,
  Archive,
  Lock
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { secureStorage } from '../services/SecureStorage';
import { PageHeader } from './PageHeader';

interface AnalyticsDashboardProps {
  onUpgradeClick: () => void;
}

export function AnalyticsDashboard({ onUpgradeClick }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check subscription status
  const hasActiveSubscription = user?.subscriptionStatus === 'active';
  const isPremiumUser = hasActiveSubscription && ['premium', 'family'].includes(user?.subscriptionPlan || '');

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    
    try {
      const allEntries = await secureStorage.getJournalEntries(user.id);
      const sortedEntries = allEntries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Data filtering based on subscription
  const getFilteredEntries = () => {
    const now = new Date();
    
    if (isPremiumUser) {
      // Premium: 5 months of data
      const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
      return entries.filter(entry => new Date(entry.createdAt) >= fiveMonthsAgo);
    } else {
      // Free: 5 days of data
      const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
      return entries.filter(entry => new Date(entry.createdAt) >= fiveDaysAgo);
    }
  };

  const filteredEntries = getFilteredEntries();
  const totalEntries = entries.length;
  const availableEntries = filteredEntries.length;
  const hiddenEntries = totalEntries - availableEntries;

  // Calculate basic stats
  const getAverageEmotion = (emotion: string) => {
    if (filteredEntries.length === 0) return 0;
    const sum = filteredEntries.reduce((acc, entry) => acc + (entry.emotions[emotion] || 0), 0);
    return Math.round((sum / filteredEntries.length) * 10) / 10;
  };

  const getEmotionTrend = (emotion: string) => {
    if (filteredEntries.length < 2) return 'stable';
    const recent = filteredEntries.slice(0, Math.ceil(filteredEntries.length / 2));
    const older = filteredEntries.slice(Math.ceil(filteredEntries.length / 2));
    
    const recentAvg = recent.reduce((acc, entry) => acc + (entry.emotions[emotion] || 0), 0) / recent.length;
    const olderAvg = older.reduce((acc, entry) => acc + (entry.emotions[emotion] || 0), 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  };

  const EmotionCard = ({ emotion, label, icon: Icon, color }: any) => {
    const average = getAverageEmotion(emotion);
    const trend = getEmotionTrend(emotion);
    const isLocked = !isPremiumUser && !['happiness', 'anxiety', 'overall'].includes(emotion);

    return (
      <Card className={isLocked ? 'opacity-60' : ''} style={isLocked ? { filter: 'grayscale(100%)' } : undefined}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${isLocked ? 'text-gray-400' : color}`} />
              <span className={`text-sm font-medium ${isLocked ? 'text-gray-500' : ''}`}>{label}</span>
              {isLocked && <Lock className="h-3 w-3 text-gray-400" />}
            </div>
            {!isLocked && (
              <Badge variant={trend === 'improving' ? 'default' : trend === 'declining' ? 'destructive' : 'secondary'}>
                {trend}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLocked ? (
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-gray-400">--</div>
              <Button size="sm" variant="outline" onClick={onUpgradeClick} style={{ filter: 'none', opacity: 1 }}>
                <Crown className="h-3 w-3 mr-1" />
                Unlock
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-2xl font-semibold">{average}/10</div>
              <Progress value={average * 10} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading your insights...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        headline="Your Emotional Insights"
        subhead={isPremiumUser
          ? "Advanced analytics to understand your emotional patterns over the past 5 months"
          : "Basic insights from your last 5 days of entries"
        }
      />

      {/* Data Access Status */}
      <Card className={`border-2 ${isPremiumUser ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isPremiumUser ? 'bg-green-100' : 'bg-amber-100'}`}>
                {isPremiumUser ? <Crown className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-amber-600" />}
              </div>
              <div>
                <p className={`font-medium ${isPremiumUser ? 'text-green-900' : 'text-amber-900'}`}>
                  {isPremiumUser ? 'Premium Analytics' : 'Limited Access'}
                </p>
                <p className={`text-sm ${isPremiumUser ? 'text-green-700' : 'text-amber-700'}`}>
                  {isPremiumUser 
                    ? `Viewing ${availableEntries} entries from the past 5 months`
                    : `Viewing ${availableEntries} entries from the past 5 days`
                  }
                </p>
              </div>
            </div>
            {!isPremiumUser && hiddenEntries > 0 && (
              <Button onClick={onUpgradeClick} size="sm">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Data Alert for Free Users */}
      {!isPremiumUser && hiddenEntries > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Archive className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                <strong>{hiddenEntries} older entries</strong> are archived. Upgrade to access your full history and advanced insights.
              </span>
              <Button size="sm" onClick={onUpgradeClick} className="ml-2">
                View All Data
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Emotion Averages Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <EmotionCard 
          emotion="happiness" 
          label="Happiness" 
          icon={Heart} 
          color="text-yellow-500" 
        />
        <EmotionCard 
          emotion="anxiety" 
          label="Anxiety" 
          icon={Zap} 
          color="text-orange-500" 
        />
        <EmotionCard 
          emotion="overall" 
          label="Overall" 
          icon={TrendingUp} 
          color="text-pink-500" 
        />
        {/* Premium emotions */}
        <EmotionCard 
          emotion="sadness" 
          label="Sadness" 
          icon={Calendar} 
          color="text-blue-500" 
        />
        <EmotionCard 
          emotion="anger" 
          label="Anger" 
          icon={Zap} 
          color="text-red-500" 
        />
        <EmotionCard 
          emotion="energy" 
          label="Energy" 
          icon={BarChart3} 
          color="text-green-500" 
        />
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Journal Entries</CardTitle>
            {!isPremiumUser && (
              <Badge variant="secondary" className="text-xs">
                Last 5 days only
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntries.length > 0 ? (
            <div className="space-y-3">
              {filteredEntries.slice(0, 10).map((entry, index) => (
                <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.date).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      Overall: {entry.emotions.overall}/10
                    </Badge>
                    {entry.sent && (
                      <Badge variant="default" className="text-xs">
                        Sent
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No entries yet. Start journaling to see your insights!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Features Showcase for Free Users */}
      {!isPremiumUser && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Crown className="h-12 w-12 text-purple-600 mx-auto" />
              <div>
                <h3 className="font-semibold text-purple-900">Unlock Advanced Analytics</h3>
                <p className="text-sm text-purple-700 mt-2">
                  Get deeper insights with 5 months of history, trend analysis, and detailed emotional patterns
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Crown className="h-4 w-4" />
                  5-month data history
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Crown className="h-4 w-4" />
                  Advanced trend analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Crown className="h-4 w-4" />
                  Mood pattern recognition
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Crown className="h-4 w-4" />
                  Weekly/monthly reports
                </div>
              </div>
              
              <Button 
                onClick={onUpgradeClick}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium - $9.99/month
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}