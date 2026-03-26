import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { AlertTriangle } from 'lucide-react';
import { AuthPageLogo } from './LogoComponent';

interface DisclaimerAcceptanceProps {
  onAccept: () => void;
}

export function DisclaimerAcceptance({ onAccept }: DisclaimerAcceptanceProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    if (isChecked) {
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <AuthPageLogo />
          </div>
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle className="text-2xl">Disclaimer</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4 max-h-96 overflow-y-auto border border-gray-200">
            <p className="text-sm text-gray-800 leading-relaxed">
              This mental health application (the "App") provides general informational and educational content only and is not intended as a substitute for professional medical advice, diagnosis, or treatment.
            </p>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-900">Not Medical Advice:</h4>
              <p className="text-sm text-gray-800 leading-relaxed">
                The content, features, or tools within this App do not constitute medical, psychological, or psychiatric advice, diagnosis, or treatment. Always seek the advice of your own qualified health provider with any questions or concerns you may have regarding a medical or mental health condition.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-900">No Doctor-Patient Relationship:</h4>
              <p className="text-sm text-gray-800 leading-relaxed">
                Your use of this App does not establish a doctor-patient or therapist-client relationship.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-900">Emergency Situations:</h4>
              <p className="text-sm text-gray-800 leading-relaxed">
                If you are experiencing a mental health crisis, severe distress, or believe you may harm yourself or others, please immediately contact emergency services (e.g., 911 in the U.S.) or a crisis hotline, and do not rely on this App.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-900">Limitation of Liability:</h4>
              <p className="text-sm text-gray-800 leading-relaxed">
                TermsFeed and WP Legal Pages advise disclaimers to limit liability. You agree that you are solely responsible for any actions taken or not taken based on the information provided in this App, and Business Name (replace with your actual business name) assumes no responsibility for errors, omissions, or any damages or losses incurred from your use or reliance on the App's content or features.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-800 font-medium mb-4">
              ⚠️ Required: You must read and accept this disclaimer before proceeding.
            </p>
            <div className="flex items-start gap-3">
              <Checkbox 
                id="disclaimer-accept" 
                checked={isChecked}
                onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                className="mt-1"
              />
              <Label 
                htmlFor="disclaimer-accept" 
                className="text-sm text-gray-800 cursor-pointer leading-relaxed font-medium"
              >
                I have read and understand this disclaimer. I acknowledge that this app is not a substitute for professional medical advice and I should contact emergency services if I'm in crisis.
              </Label>
            </div>
          </div>

          <Button 
            onClick={handleAccept}
            disabled={!isChecked}
            className="w-full"
            size="lg"
          >
            Continue to App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}