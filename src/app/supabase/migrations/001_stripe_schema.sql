-- Stripe Integration Database Schema
-- Run this migration in Supabase SQL Editor

-- Add Stripe-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);

-- Create subscription events log table for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- checkout_completed, subscription_updated, payment_succeeded, etc.
  stripe_event_id TEXT NOT NULL,
  status TEXT,
  amount INTEGER, -- Amount in cents
  currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for subscription events
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type);

-- Create subscription metrics view (optional - for analytics)
CREATE OR REPLACE VIEW subscription_metrics AS
SELECT 
  u.subscription_plan,
  u.subscription_status,
  COUNT(*) as user_count,
  SUM(CASE WHEN u.subscription_status = 'active' THEN 1 ELSE 0 END) as active_count,
  SUM(CASE WHEN u.subscription_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
  SUM(CASE WHEN u.subscription_status = 'past_due' THEN 1 ELSE 0 END) as past_due_count
FROM users u
GROUP BY u.subscription_plan, u.subscription_status;

-- Row Level Security Policies

-- Users can only read their own subscription data
CREATE POLICY "Users can view own subscription data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Users can only view their own subscription events
CREATE POLICY "Users can view own subscription events" 
  ON subscription_events FOR SELECT 
  USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has active premium subscription
CREATE OR REPLACE FUNCTION has_active_premium()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND subscription_status = 'active'
    AND subscription_plan IN ('premium', 'family')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user subscription info
CREATE OR REPLACE FUNCTION get_subscription_info()
RETURNS TABLE (
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.subscription_plan::TEXT,
    u.subscription_status::TEXT,
    u.current_period_end,
    CASE 
      WHEN u.subscription_plan = 'premium' OR u.subscription_plan = 'family' THEN
        jsonb_build_object(
          'emotionSliders', 6,
          'historyDays', 150,
          'analytics', true,
          'therapistSharing', true
        )
      ELSE
        jsonb_build_object(
          'emotionSliders', 3,
          'historyDays', 5,
          'analytics', false,
          'therapistSharing', false
        )
    END
  FROM users u
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE subscription_events IS 'Audit log for all subscription-related events from Stripe';
COMMENT ON FUNCTION has_active_premium() IS 'Check if current user has active premium subscription';
COMMENT ON FUNCTION get_subscription_info() IS 'Get current user subscription info with feature flags';
