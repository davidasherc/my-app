import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Check, Crown, Star, Users, Zap, Mail, BarChart3, Shield, Archive, TrendingUp, ExternalLink } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { createCheckoutSession, redirectToCheckout, getPriceId, createPortalSession } from '../utils/stripe';
import { toast } from 'sonner@2.0.3';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  limitations?: string[];
  icon: React.ElementType;
  popular?: boolean;
  color: string;
  emotionSliders: number;
  historyAccess: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for getting started with emotional tracking',
    features: [
      '3 core emotion sliders',
      'Daily emotion tracking',
      'Basic mood overview',
      'HIPAA-compliant security',
      'Export recent entries'
    ],
    limitations: [
      'Only 5 days of history',
      'Limited to 3 emotions',
      'No advanced insights',
      'No therapist collaboration'
    ],
    icon: Star,
    color: 'text-blue-600',
    emotionSliders: 3,
    historyAccess: '5 days'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { monthly: 9.99, yearly: 99.99 },
    description: 'Advanced features for deeper emotional wellness',
    features: [
      'All 6 detailed emotion sliders',
      '5 months of data history',
      'Advanced analytics & trends',
      'Therapist sharing & collaboration',
      'Custom reminders & goals',
      'Mood pattern recognition',
      'Weekly & monthly reports',
      'Priority support',
      'Data backup & sync'
    ],
    icon: Crown,
    popular: true,
    color: 'text-purple-600',
    emotionSliders: 6,
    historyAccess: '5 months'
  },
  {
    id: 'family',
    name: 'Family',
    price: { monthly: 14.99, yearly: 149.99 },
    description: 'Perfect for families and couples therapy',
    features: [
      'Everything in Premium',
      'Up to 4 family member accounts',
      'Family insights dashboard',
      'Couple & family therapy features',
      'Shared goal tracking',
      'Family therapist collaboration',
      'Advanced privacy controls',
      'Unlimited data history'
    ],
    icon: Users,
    color: 'text-green-600',
    emotionSliders: 6,
    historyAccess: 'Unlimited'
  }
];

export function SubscriptionManager() {
  const { user, updateProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>(user?.subscriptionPlan || 'free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  console.log('🔥🔥🔥🔥🔥 SUBSCRIPTION MANAGER LOADED! USER:', user);

  // 🚨🚨🚨 VERSION CHECK - IF YOU SEE THIS IN CONSOLE, CODE IS UPDATED! 🚨🚨🚨
  console.log('🚨🚨🚨 SUBSCRIPTION MANAGER VERSION: 2024-03-25-CACHE-BUSTER-V3 🚨🚨🚨');
  console.log('🚨🚨🚨 TIMESTAMP:', new Date().toISOString(), '🚨🚨🚨');

  const currentPlan = plans.find(p => p.id === (user?.subscriptionPlan || 'free'));
  const newPlan = plans.find(p => p.id === selectedPlan);

  const handleSubscribe = async (planId: string) => {
    console.log('🚨🚨🚨 HANDLE SUBSCRIBE CALLED! 🚨🚨🚨', { planId });
    console.log('🚨 USER OBJECT:', user);
    console.log('🚨 USER ID:', user?.id);
    console.log('🚨 USER EMAIL:', user?.email);
    console.log('🚨 USER SUBSCRIPTION PLAN:', user?.subscriptionPlan);
    console.log('🚨 USER SUBSCRIPTION STATUS:', user?.subscriptionStatus);
    
    if (planId === 'free') {
      // Handle downgrade to free
      toast.info('Please use the Customer Portal to cancel your subscription');
      return;
    }
    
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    if (!user.id || !user.email) {
      console.error('❌ User missing required fields!', user);
      toast.error('User data incomplete. Please log out and log back in.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('💳 Creating checkout session for plan:', planId, 'billing:', billingCycle);
      const priceId = getPriceId(planId, billingCycle);
      console.log('💳 Price ID:', priceId);
      
      if (!priceId) {
        throw new Error(`No price ID found for plan: ${planId}`);
      }

      const sessionParams = {
        priceId,
        userId: user.id,
        email: user.email,
        planName: planId,
      };
      
      console.log('💳 Session params:', sessionParams);
      console.log('💳 Calling createCheckoutSession...');
      
      const session = await createCheckoutSession(sessionParams);
      console.log('💳 Checkout session created:', session);

      if (session?.url) {
        console.log('💳 Redirecting to checkout URL:', session.url);
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('❌ Subscription error:', error);
      toast.error(`Failed to start subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.stripeCustomerId) {
      toast.error('No active subscription to manage');
      return;
    }

    setIsProcessing(true);
    
    try {
      const portal = await createPortalSession(user.stripeCustomerId);
      
      if (portal?.url) {
        window.location.href = portal.url;
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (plan.id === 'free') {
      return user?.subscriptionPlan === 'free' || !user?.subscriptionPlan ? 'Current Plan' : 'Downgrade to Free';
    }
    if (user?.subscriptionPlan === plan.id && user?.subscriptionStatus === 'active') {
      return 'Current Plan';
    }
    if (isProcessing && selectedPlan === plan.id) {
      return 'Processing...';
    }
    return `Upgrade to ${plan.name}`;
  };

  const getButtonVariant = (plan: SubscriptionPlan) => {
    if (user?.subscriptionPlan === plan.id && user?.subscriptionStatus === 'active') {
      return 'outline';
    }
    if (plan.id === 'free') {
      return 'secondary';
    }
    return plan.popular ? 'default' : 'outline';
  };

  const isCurrentPlan = (planId: string) => {
    return (user?.subscriptionPlan || 'free') === planId && user?.subscriptionStatus === 'active';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* TESTING - HUGE RED BANNER */}
      <div className="bg-red-600 text-white p-8 text-center text-4xl font-bold">
        🚨 CODE IS UPDATING! IF YOU SEE THIS, THE CODE WORKS! 🚨
      </div>
      
      <div className="text-center space-y-2">
        <h1>Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Start free, upgrade when you need more detailed insights and history
        </p>
      </div>

      {/* Current Plan Status */}
      {user && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {currentPlan && <currentPlan.icon className={`h-5 w-5 ${currentPlan.color}`} />}
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    Current Plan: {currentPlan?.name || 'Free'}
                  </p>
                  <p className="text-sm text-blue-700">
                    {currentPlan?.emotionSliders} emotion sliders • {currentPlan?.historyAccess} history
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                  {user.subscriptionStatus || 'Free'}
                </Badge>
                {user.subscriptionStatus === 'active' && user.subscriptionPlan !== 'free' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Manage
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Subscription updated successfully! You now have access to all {newPlan?.name} features.
          </AlertDescription>
        </Alert>
      )}

      {/* Feature Comparison Table - Mobile Friendly */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2 px-2">
                    <div className="flex flex-col items-center">
                      <Star className="h-4 w-4 text-blue-600 mb-1" />
                      <span>Free</span>
                    </div>
                  </th>
                  <th className="text-center py-2 px-2">
                    <div className="flex flex-col items-center">
                      <Crown className="h-4 w-4 text-purple-600 mb-1" />
                      <span>Premium</span>
                    </div>
                  </th>
                  <th className="text-center py-2 px-2">
                    <div className="flex flex-col items-center">
                      <Users className="h-4 w-4 text-green-600 mb-1" />
                      <span>Family</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-3">Emotion Sliders</td>
                  <td className="text-center">3 core</td>
                  <td className="text-center">6 detailed</td>
                  <td className="text-center">6 detailed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Data History</td>
                  <td className="text-center">5 days</td>
                  <td className="text-center">5 months</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Advanced Analytics</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Therapist Sharing</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Family Accounts</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">Up to 4</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Billing Toggle - Only show for paid plans */}
      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="relative">
              Yearly
              <Badge className="ml-2 text-xs bg-green-100 text-green-800">Save 17%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrentUserPlan = isCurrentPlan(plan.id);
          const price = plan.price[billingCycle];
          const yearlyDiscount = billingCycle === 'yearly' && plan.price.monthly > 0 
            ? Math.round(((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12)) * 100) 
            : 0;

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''} ${isCurrentUserPlan ? 'border-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                </div>
              )}
              {isCurrentUserPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white">Current</Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <IconComponent className={`h-6 w-6 ${plan.color}`} />
                  </div>
                </div>
                <div>
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.name}
                    {plan.id === 'free' && <Badge variant="secondary">Free Forever</Badge>}
                  </CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {plan.price.monthly === 0 ? 'Free' : `$${price}`}
                    {plan.price.monthly > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && yearlyDiscount > 0 && (
                    <p className="text-sm text-green-600">Save {yearlyDiscount}% yearly</p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Stats */}
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="font-semibold text-lg">{plan.emotionSliders}</div>
                      <div className="text-muted-foreground">Emotions</div>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{plan.historyAccess}</div>
                      <div className="text-muted-foreground">History</div>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations && (
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-3 w-3 rounded-full bg-gray-300 mt-1 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={getButtonVariant(plan)}
                  disabled={isCurrentUserPlan || (isProcessing && selectedPlan === plan.id)}
                  onClick={() => {
                    console.log('🟢🟢🟢 BUTTON CLICKED!', { planId: plan.id, planName: plan.name });
                    setSelectedPlan(plan.id);
                    handleSubscribe(plan.id);
                  }}
                >
                  {getButtonText(plan)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Value Proposition for Free Users */}
      {(!user?.subscriptionPlan || user?.subscriptionPlan === 'free') && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto" />
              <div>
                <h3 className="font-semibold text-purple-900">Why Upgrade to Premium?</h3>
                <p className="text-sm text-purple-700 mt-2">
                  Most users find deeper insights and patterns after tracking for a few weeks
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Archive className="h-4 w-4 flex-shrink-0" />
                  Keep 5 months of data vs. 5 days
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  See trends and patterns over time
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Zap className="h-4 w-4 flex-shrink-0" />
                  Track 6 detailed emotions
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  Share insights with therapist
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-purple-700">
                  <strong>💡 Pro tip:</strong> Users who upgrade after 1 week see 2x more insights from their existing data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security & Compliance Notice */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700 space-y-2">
              <p className="font-medium">Security & Compliance</p>
              <ul className="space-y-1 text-xs">
                <li>• All plans include HIPAA-compliant data encryption</li>
                <li>• Secure payment processing through Stripe (PCI-DSS certified)</li>
                <li>• Cancel anytime with immediate effect</li>
                <li>• 30-day money-back guarantee on all paid plans</li>
                <li>• Free plan is always available - no time limits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}