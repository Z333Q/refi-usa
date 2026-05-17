/*
  # Add Execution Policy, Managed Execution, and Tiered Advice Support

  ## Summary
  Extends the ReFi Trading schema to support the tiered advice model:
  - ReFi Signal: personalized software-generated recommendations, no auto-execution
  - ReFi Managed: automatic broker submission inside user-approved execution policy

  ## New Tables

  ### execution_policies
  User-approved rule set governing automatic broker submission.
  Fields: mode, max_order_value, max_position_pct, daily_order_limit, cash_reserve,
  restricted_sectors, loss_pause_pct, drawdown_pause_pct, status, version.

  ### automation_eligibility_checks
  Per-recommendation eligibility decision for automatic execution.
  Fields: recommendation_id, policy_version, status, reason_codes, pass_fail_checks.

  ### broker_submissions
  Record of orders submitted to connected broker by ReFi Managed.
  Fields: recommendation_id, order_type, amount, broker_order_id, fill_status.

  ## Modified Tables

  ### profiles
  - Add: subscription_tier (signal | managed), managed_active (bool), managed_paused_reason

  ### recommendations
  - Add: rec_type, automation_status, execution_policy_version, broker_submission_id,
    advice_basis (jsonb snapshot of profile/model/broker versions at generation time)
    estimated_cost column already exists

  ## Security
  RLS enabled on all new tables. All policies check auth.uid() = user_id.
*/

-- Add subscription tier + managed status to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'signal';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'managed_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN managed_active boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'managed_paused_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN managed_paused_reason text DEFAULT '';
  END IF;
END $$;

-- Add automation fields to recommendations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'rec_type'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN rec_type text DEFAULT 'rebalance';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'automation_status'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN automation_status text DEFAULT 'pending_check';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'execution_policy_version'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN execution_policy_version int DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'model_version'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN model_version text DEFAULT 'refi-advice-0.9.2';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'profile_version'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN profile_version int DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'advice_basis'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN advice_basis jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'broker_submission_id'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN broker_submission_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN expires_at timestamptz;
  END IF;
END $$;

-- Create execution_policies table
CREATE TABLE IF NOT EXISTS execution_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  mode text NOT NULL DEFAULT 'signal',
  strategy_name text DEFAULT 'Balanced Growth',
  max_order_value numeric DEFAULT 2000,
  max_position_pct numeric DEFAULT 8,
  daily_order_limit int DEFAULT 4,
  min_cash_reserve numeric DEFAULT 2500,
  restricted_sectors text[] DEFAULT '{}',
  daily_loss_pause_pct numeric DEFAULT 2,
  drawdown_pause_pct numeric DEFAULT 8,
  market_orders_allowed boolean DEFAULT false,
  limit_orders_required boolean DEFAULT true,
  allowed_asset_classes text[] DEFAULT ARRAY['US equities', 'ETFs', 'Bonds'],
  status text DEFAULT 'active',
  user_approved_at timestamptz,
  effective_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE execution_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own execution policies"
  ON execution_policies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own execution policies"
  ON execution_policies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own execution policies"
  ON execution_policies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create automation_eligibility_checks table
CREATE TABLE IF NOT EXISTS automation_eligibility_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  execution_policy_version int DEFAULT 1,
  status text DEFAULT 'pending',
  reason_codes text[] DEFAULT '{}',
  pass_fail_checks jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE automation_eligibility_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own eligibility checks"
  ON automation_eligibility_checks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own eligibility checks"
  ON automation_eligibility_checks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create broker_submissions table
CREATE TABLE IF NOT EXISTS broker_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id uuid REFERENCES recommendations(id),
  execution_policy_version int DEFAULT 1,
  order_type text DEFAULT 'limit',
  asset text DEFAULT '',
  amount numeric DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  broker_order_id text DEFAULT '',
  fill_status text DEFAULT 'pending',
  fill_price numeric,
  fill_quantity numeric,
  filled_at timestamptz,
  rejection_reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE broker_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own broker submissions"
  ON broker_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own broker submissions"
  ON broker_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
