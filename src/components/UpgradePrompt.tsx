import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Crown, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  onUpgradeClick: () => void;
  variant?: 'header' | 'footer';
  className?: string;
}

export function UpgradePrompt({ onUpgradeClick, variant = 'header', className = '' }: UpgradePromptProps) {
  if (variant === 'header') {
    return (
      <Card className={`border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 ${className}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                {/* 🎯 EDIT THIS: Upgrade prompt heading */}
                <h3 className="font-semibold text-purple-900">Unlock Premium Features</h3>
                {/* 🎯 EDIT THIS: Upgrade prompt description */}
                <p className="text-sm text-purple-700">
                  Get unlimited history, all 6 emotion sliders, and advanced insights
                </p>
              </div>
            </div>
            <Button 
              onClick={onUpgradeClick}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Crown className="h-5 w-5 mr-2" />
              {/* 🎯 EDIT THIS: Upgrade button text */}
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Footer variant
  return (
    <Card className={`border-purple-300 bg-gradient-to-br from-purple-600 to-blue-600 text-white ${className}`}>
      <CardContent className="py-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8" />
            {/* 🎯 EDIT THIS: Footer upgrade heading */}
            <h3 className="text-2xl font-bold">Ready to Unlock Your Full Wellness Journey?</h3>
          </div>
          {/* 🎯 EDIT THIS: Footer upgrade description */}
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join Premium today and get unlimited access to your complete emotional history, 
            all emotion tracking tools, and powerful insights that help you grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Button 
              onClick={onUpgradeClick}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              <Crown className="h-6 w-6 mr-2" />
              {/* 🎯 EDIT THIS: Footer upgrade button text */}
              Upgrade to Premium - $9.99/month
            </Button>
          </div>
          {/* 🎯 EDIT THIS: Footer upgrade features list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto text-sm">
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-4 w-4" />
              <span>Unlimited History</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-4 w-4" />
              <span>All 6 Emotion Sliders</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-4 w-4" />
              <span>Advanced Insights</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
