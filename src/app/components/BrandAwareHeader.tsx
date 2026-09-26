import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, Crown, Clock, LogOut, Settings } from 'lucide-react';
import { useBranding } from './BrandingProvider';

interface BrandAwareHeaderProps {
  user: any;
  hasActiveSubscription: boolean;
  isPremiumUser: boolean;
  onLogout: () => void;
  onSettingsClick?: () => void;
}

export function BrandAwareHeader({ 
  user, 
  hasActiveSubscription, 
  isPremiumUser, 
  onLogout,
  onSettingsClick 
}: BrandAwareHeaderProps) {
  const { config } = useBranding();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Branded Logo/Icon */}
          {(config.logoHeader || config.logo) ? (
            <img
              src={config.logoHeader || config.logo}
              alt={config.appName}
              className="h-14 w-auto object-contain"
            />
          ) : (
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${config.primaryColor}20` }}
            >
              <Heart className="h-7 w-7" style={{ color: config.primaryColor }} />
            </div>
          )}
          <div>
            <h1 
              className="text-lg font-semibold"
              style={{ color: config.primaryColor }}
            >
              {config.appName}
            </h1>
            <p className="text-xs text-gray-600">
              Welcome back, {user?.firstName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Branded Subscription Badge */}
          <Badge 
            variant={hasActiveSubscription ? 'default' : 'secondary'}
            className="hidden sm:flex"
            style={{
              backgroundColor: hasActiveSubscription ? config.primaryColor : undefined,
              color: hasActiveSubscription ? '#ffffff' : undefined
            }}
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
            {/* Settings Button */}
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
                className="hidden lg:flex"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}

            {/* User Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarFallback 
                style={{ 
                  backgroundColor: `${config.primaryColor}20`,
                  color: config.primaryColor 
                }}
              >
                {getInitials(user?.firstName || 'U', user?.lastName || 'U')}
              </AvatarFallback>
            </Avatar>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}