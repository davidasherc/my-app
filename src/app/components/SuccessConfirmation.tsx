import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { CheckCircle, Heart, Calendar, Mail } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface SuccessConfirmationProps {
  onNewEntry: () => void;
  therapistEmail?: string;
}

export function SuccessConfirmation({ onNewEntry, therapistEmail }: SuccessConfirmationProps) {
  const { user } = useAuth();
  
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
          <h1 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'bc-alphapipe, graphie, sans-serif' }}>Entry Sent Successfully!</h1>
          <p className="text-white" style={{ fontFamily: "'KoHo', sans-serif", lineHeight: 'calc(1.5em - 1px)' }}>
            Your emotional check-in for {getDate()}<br />has been shared with your therapist.
          </p>
        </div>
      </div>

      {therapistEmail && (
        <Card className="border-green-200 bg-green-50" style={{ fontFamily: "'KoHo', sans-serif" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-base font-medium text-green-900">
                  Sent to: {therapistEmail}
                </p>
                <p className="text-sm text-green-700">
                  Your therapist will be notified of your new entry
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50" style={{ fontFamily: "'KoHo', sans-serif" }}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-medium text-blue-900 mb-1">
                  You're doing great!
                </p>
                <p className="text-sm text-blue-700">
                  Taking time to check in with your emotions is an important step in your mental health journey.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-medium text-blue-900 mb-1">
                  What's next?
                </p>
                <p className="text-sm text-blue-700">
                  Your therapist will review your entry and may discuss it during your next session. Feel free to add another entry anytime.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-medium text-blue-900 mb-1">
                  Contact Your Therapist
                </p>
                <p className="text-sm text-blue-700">
                  If you have any questions or need further assistance, you can contact your therapist directly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button
          onClick={onNewEntry}
          className="w-full h-12 text-white border-0"
          size="lg"
          style={{ background: 'linear-gradient(to right, #70ced7, #3866e1)', fontFamily: 'bc-alphapipe, graphie, sans-serif', fontSize: '1.21rem' }}
        >
          Create New Entry
        </Button>
      </div>
    </div>
  );
}