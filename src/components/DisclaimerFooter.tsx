import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function DisclaimerFooter() {
  return (
    <Alert className="border-red-200 bg-red-50 mt-4">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-xs text-red-800 leading-relaxed">
        This app is for general informational & educational purposes only, not a substitute for professional medical/mental health advice, diagnosis, or treatment; seek professional help for crises; no doctor-patient relationship; we're not liable for actions taken based on content. If you are in crisis or considering self harm or suicide, please dial 911 or your nearest crisis center immediately.
      </AlertDescription>
    </Alert>
  );
}
