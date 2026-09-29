import { useState } from 'react';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Heart, Zap, CloudRain, Flame, Sun, Smile, Crown, Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PageHeader } from './PageHeader';

interface EmotionData {
  happiness: number;
  anxiety: number;
  sadness: number;
  anger: number;
  energy: number;
  overall: number;
}

interface JournalEntryProps {
  onComplete: (data: EmotionData) => void;
  onUpgradeClick: () => void;
}

export function JournalEntry({ onComplete, onUpgradeClick }: JournalEntryProps) {
  const { user } = useAuth();
  const [emotions, setEmotions] = useState<EmotionData>({
    happiness: 5,
    anxiety: 5,
    sadness: 5,
    anger: 5,
    energy: 5,
    overall: 5
  });

  // Check if user has premium access
  const hasActiveSubscription = user?.subscriptionStatus === 'active';
  const isPremiumUser = hasActiveSubscription && ['premium', 'family'].includes(user?.subscriptionPlan || '');

  const updateEmotion = (emotion: keyof EmotionData, value: number) => {
    setEmotions(prev => ({ ...prev, [emotion]: value }));
  };

  // Core emotions available to all users
  const coreEmotions = [
    {
      key: 'happiness' as keyof EmotionData,
      label: 'Happiness & Joy',
      description: 'How happy and joyful are you feeling today?',
      icon: Smile,
      color: 'text-yellow-500',
      lowLabel: 'Not happy',
      highLabel: 'Very happy'
    },
    {
      key: 'anxiety' as keyof EmotionData,
      label: 'Anxiety & Stress',
      description: 'How anxious or stressed do you feel?',
      icon: Zap,
      color: 'text-orange-500',
      lowLabel: 'Very calm',
      highLabel: 'Very anxious'
    },
    {
      key: 'overall' as keyof EmotionData,
      label: 'Overall Mood',
      description: 'How would you rate your overall mood?',
      icon: Heart,
      color: 'text-pink-500',
      lowLabel: 'Poor',
      highLabel: 'Excellent'
    }
  ];

  // Premium emotions - only available to premium users
  const premiumEmotions = [
    {
      key: 'sadness' as keyof EmotionData,
      label: 'Sadness',
      description: 'Are you feeling sad or down today?',
      icon: CloudRain,
      color: 'text-blue-500',
      lowLabel: 'Not sad',
      highLabel: 'Very sad'
    },
    {
      key: 'anger' as keyof EmotionData,
      label: 'Anger & Frustration',
      description: 'How angry or frustrated are you feeling?',
      icon: Flame,
      color: 'text-red-500',
      lowLabel: 'Very calm',
      highLabel: 'Very angry'
    },
    {
      key: 'energy' as keyof EmotionData,
      label: 'Energy Level',
      description: 'How energetic do you feel today?',
      icon: Sun,
      color: 'text-green-500',
      lowLabel: 'No Energy',
      highLabel: 'Very Energetic'
    }
  ];

  const EmotionSlider = ({ emotion, isLocked = false }: { emotion: any; isLocked?: boolean }) => {
    const { key, label, description, icon: Icon, iconImage, color, lowLabel, highLabel } = emotion;
    
    return (
      <Card className={`border-0 shadow-sm ${isLocked ? 'opacity-60' : ''}`} style={isLocked ? { filter: 'grayscale(100%)' } : undefined}>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {iconImage ? (
                <ImageWithFallback 
                  src={iconImage} 
                  alt={label}
                  className={`h-5 w-5 sm:h-6 sm:w-6 object-contain flex-shrink-0`}
                />
              ) : (
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isLocked ? 'text-gray-400' : color} flex-shrink-0`} />
              )}
              {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className={`text-sm sm:text-base leading-tight ${isLocked ? 'text-gray-500 opacity-60' : ''}`} style={{ fontFamily: "'KoHo', sans-serif", fontWeight: 700 }}>{label}</CardTitle>
                {isLocked && (
                  <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-500">
                    Premium
                  </Badge>
                )}
              </div>
              <CardDescription className={`text-xs sm:text-sm mt-1 ${isLocked ? 'text-gray-400' : ''}`} style={{ fontFamily: "'KoHo', sans-serif", position: 'relative', top: '-2px' }}>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          <div className="py-2">
            <Slider
              value={[emotions[key]]}
              onValueChange={isLocked ? undefined : ([value]) => updateEmotion(key, value)}
              max={10}
              min={1}
              step={1}
              className={`w-full ${isLocked ? 'pointer-events-none opacity-40' : ''}`}
              disabled={isLocked}
            />
          </div>
          <div className={`flex justify-between text-xs sm:text-sm ${isLocked ? 'text-gray-400' : 'text-muted-foreground'}`}>
            <span className="text-left max-w-[30%]">{lowLabel}</span>
            <span className={`font-medium px-2 py-1 rounded shadow-sm ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-white text-foreground'}`}>
              {emotions[key]}/10
            </span>
            <span className="text-right max-w-[30%]">{highLabel}</span>
          </div>
          {isLocked && (
            <div className="text-center">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onUpgradeClick}
                className="text-xs"
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade to track
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <PageHeader
        headline="Mood2Day Daily Emotional Journal"
        subhead={<>Take a moment to check in with yourself.<br /><span style={{ position: 'relative', top: '-3px', display: 'inline-block' }}>Move the sliders to reflect how you&apos;re feeling right&nbsp;now</span></>}
      />

      {/* Subscription Status Banner */}
      {!isPremiumUser && (
        <Alert className="border-blue-200 bg-blue-50">
          <Crown className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                You're using the <strong>free version</strong> with 3 core emotions
              </span>
              <Button 
                size="sm" 
                onClick={onUpgradeClick}
                className="ml-2 bg-blue-600 hover:bg-blue-700"
              >
                Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Core Emotions - Always Available */}
        <div className="space-y-4">
          {isPremiumUser && (
            <div className="flex items-center gap-2 px-2" style={{ position: 'relative', top: '4px' }}>
              <Heart className="h-4 w-4 text-white" />
              <span className="font-bold text-white" style={{ fontSize: '1.04rem' }}>Core Emotions</span>
            </div>
          )}
          {coreEmotions.map((emotion) => (
            <EmotionSlider key={emotion.key} emotion={emotion} />
          ))}

          {/* Continue button lives under the first 3 sliders */}
          <div className="pt-2 px-2">
            <Button
              onClick={() => onComplete(emotions)}
              className="w-full h-12 sm:h-14 text-base text-white border-0"
              size="lg"
              style={{ background: 'linear-gradient(to right, #70ced7, #3866e1)' }}
            >
              Continue to Review
            </Button>
          </div>
        </div>

        {/* Premium Emotions */}
        <div className="space-y-4">
          {isPremiumUser ? (
            <>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.45)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }}
              >
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Advanced Emotions</span>
                <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
              </div>
              {premiumEmotions.map((emotion) => (
                <EmotionSlider key={emotion.key} emotion={emotion} />
              ))}
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="border-t border-dashed border-gray-300 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background px-3">
                    <span className="text-sm text-muted-foreground">Premium Features</span>
                  </div>
                </div>
              </div>
              {premiumEmotions.map((emotion) => (
                <EmotionSlider key={emotion.key} emotion={emotion} isLocked={true} />
              ))}
              
              {/* Premium Upgrade Card */}
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-6 text-center space-y-4">
                  <Crown className="h-8 w-8 text-purple-600 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-purple-900">Unlock Advanced Emotional Tracking</h3>
                    <p className="text-sm text-purple-700 mt-2">
                      Get deeper insights with detailed emotion tracking, including sadness, anger, and energy levels
                    </p>
                  </div>
                  <Button 
                    onClick={onUpgradeClick}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Second continue button — active for premium, locked for free */}
        <div className="pt-2 px-2">
          <Button
            onClick={() => isPremiumUser && onComplete(emotions)}
            className="w-full h-12 sm:h-14 text-base text-white border-0"
            size="lg"
            disabled={!isPremiumUser}
            style={isPremiumUser ? { background: 'linear-gradient(to right, #70ced7, #3866e1)' } : undefined}
            title={!isPremiumUser ? 'Upgrade to Premium to use all 6 emotions' : ''}
          >
            {!isPremiumUser ? (
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Continue to Review — Premium Only
              </span>
            ) : (
              'Continue to Review'
            )}
          </Button>
        </div>
      </div>

      {/* Feature Comparison for Free Users */}
      {!isPremiumUser && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-4">
            <div className="text-center space-y-3">
              <h4 className="font-medium text-sm">What you get with Premium:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-purple-600" />
                  6 detailed emotions
                </div>
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-purple-600" />
                  5-month history
                </div>
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-purple-600" />
                  Advanced insights
                </div>
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-purple-600" />
                  Trend analysis
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}