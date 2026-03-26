import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { CheckCircle, Heart, Calendar } from 'lucide-react';

interface SuccessConfirmationProps {
  onNewEntry: () => void;
}

export function SuccessConfirmation({ onNewEntry }: SuccessConfirmationProps) {
  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1>Entry Sent Successfully!</h1>
          <p className="text-muted-foreground">
            Your emotional check-in for {getDate()} has been shared with your therapist.
          </p>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  You're doing great!
                </p>
                <p className="text-xs text-blue-700">
                  Taking time to check in with your emotions is an important step in your mental health journey.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  What's next?
                </p>
                <p className="text-xs text-blue-700">
                  Your therapist will review your entry and may discuss it during your next session. Feel free to add another entry anytime.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button 
          onClick={onNewEntry}
          className="w-full h-12"
          size="lg"
          variant="outline"
        >
          Create New Entry
        </Button>
      </div>
    </div>
  );
}