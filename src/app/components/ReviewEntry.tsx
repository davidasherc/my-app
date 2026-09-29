import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Heart, Zap, CloudRain, Flame, Sun, Smile, Send, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';

interface EmotionData {
  happiness: number;
  anxiety: number;
  sadness: number;
  anger: number;
  energy: number;
  overall: number;
}

interface ReviewEntryProps {
  emotions: EmotionData;
  onSend: (therapistEmail: string) => void;
  onBack: () => void;
}

export function ReviewEntry({ emotions, onSend, onBack }: ReviewEntryProps) {
  const { user, updateProfile } = useAuth();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [therapistEmail, setTherapistEmail] = useState(user?.therapistEmail || '');
  const [saveEmail, setSaveEmail] = useState(true);
  const [emailError, setEmailError] = useState('');
  
  // Check subscription status
  const hasActiveSubscription = user?.subscriptionStatus === 'active';
  const isPremiumUser = hasActiveSubscription && ['premium', 'family'].includes(user?.subscriptionPlan || '');

  const emotionConfig = [
    { key: 'happiness', label: 'Happiness & Joy', icon: Smile, color: 'text-yellow-500', isPremium: false },
    { key: 'anxiety', label: 'Anxiety & Stress', icon: Zap, color: 'text-orange-500', isPremium: false },
    { key: 'sadness', label: 'Sadness', icon: CloudRain, color: 'text-blue-500', isPremium: true },
    { key: 'anger', label: 'Anger & Frustration', icon: Flame, color: 'text-red-500', isPremium: true },
    { key: 'energy', label: 'Energy Level', icon: Sun, color: 'text-green-500', isPremium: true },
    { key: 'overall', label: 'Overall Mood', icon: Heart, color: 'text-pink-500', isPremium: false }
  ];

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEmotionDescription = (value: number) => {
    if (value <= 3) return 'Low';
    if (value <= 7) return 'Moderate';
    return 'High';
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendClick = () => {
    // If user already has a therapist email saved, use it
    if (user?.therapistEmail) {
      onSend(user.therapistEmail);
    } else {
      // Otherwise, show the dialog to collect email
      setShowEmailDialog(true);
    }
  };

  const handleConfirmSend = async () => {
    // Validate email
    if (!therapistEmail.trim()) {
      setEmailError('Please enter your therapist\'s email address');
      return;
    }

    if (!validateEmail(therapistEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Save email to profile if checkbox is checked
    if (saveEmail && updateProfile) {
      await updateProfile({ therapistEmail });
    }

    // Close dialog and proceed with sending
    setShowEmailDialog(false);
    onSend(therapistEmail);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2" style={{ position: 'relative', top: '2px' }}>
        <h1 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'bc-alphapipe, graphie, sans-serif', position: 'relative', top: '2px' }}>Review Your Entry</h1>
        <p className="font-semibold text-white" style={{ fontFamily: "'KoHo', sans-serif", position: 'relative', top: '-4px' }}>{getDate()}</p>
      </div>

      <Card style={{ fontFamily: "'KoHo', sans-serif" }}>
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: 'bc-alphapipe, graphie, sans-serif' }}>Today's Emotional Check-in</CardTitle>
          <CardDescription>
            Here's a summary of how you're feeling today. This will be shared with your therapist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emotionConfig.map(({ key, label, icon: Icon, color, isPremium }, index) => {
            const value = emotions[key as keyof EmotionData];
            const isLocked = isPremium && !isPremiumUser;
            
            return (
              <div key={key}>
                <div 
                  className={`flex items-center justify-between ${isLocked ? 'opacity-60' : ''}`}
                  style={isLocked ? { filter: 'grayscale(100%)' } : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isLocked ? 'text-gray-400' : color}`} />
                    <span className={`text-sm ${isLocked ? 'text-gray-500' : ''}`}>{label}</span>
                    {isLocked && (
                      <Lock className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isLocked ? 'text-gray-400' : 'text-muted-foreground'}`}>
                      {getEmotionDescription(value)}
                    </span>
                    <span className={`text-sm font-medium ${isLocked ? 'text-gray-400' : ''}`}>{value}/10</span>
                  </div>
                </div>
                {index < emotionConfig.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Heart className="h-4 w-4 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-900" style={{ fontFamily: 'bc-alphapipe, graphie, sans-serif', fontSize: '1.04rem' }}>
                Great job checking in with yourself today!
              </p>
              <p className="text-xs text-green-700" style={{ fontFamily: "'KoHo', sans-serif" }}>
                Your therapist will receive this information and may discuss it with you during your next session, once you click send!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-12"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Edit
        </Button>
        <Button
          onClick={handleSendClick}
          className="flex-1 h-12 text-white border-0"
          size="lg"
          style={{ background: 'linear-gradient(to right, #70ced7, #3866e1)' }}
        >
          <Send className="h-4 w-4 mr-2" />
          Send to Therapist
        </Button>
      </div>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Therapist Email</DialogTitle>
            <DialogDescription>
              Please enter your therapist's email address to send your emotional check-in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="therapist@example.com"
                value={therapistEmail}
                onChange={(e) => setTherapistEmail(e.target.value)}
                className="w-full"
              />
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="save-email"
                checked={saveEmail}
                onCheckedChange={(checked) => setSaveEmail(checked as boolean)}
              />
              <Label htmlFor="save-email">Save email for future check-ins</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSend}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}