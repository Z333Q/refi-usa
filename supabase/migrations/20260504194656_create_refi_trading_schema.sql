/*
  # ReFi Trading - Core Schema

  Creates the database tables for the ReFi automated investing platform.

  1. New Tables
    - `profiles` - User profile and onboarding state
    - `investor_profiles` - Suitability / risk questionnaire data
    - `recommendations` - Portfolio recommendations for users
    - `activity_events` - Audit log of all user-facing events
    - `documents` - Document library (Form CRS, ADV, statements)

  2. Security
    - RLS enabled on all tables
    - Users can only read/write their own data
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  state text DEFAULT '',
  onboarding_complete boolean DEFAULT false,
  management_mode text DEFAULT 'review',
  brokerage_connected boolean DEFAULT false,
  brokerage_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal text DEFAULT 'long_term_growth',
  time_horizon text DEFAULT '10+',
  risk_level text DEFAULT 'moderate',
  annual_income text DEFAULT '',
  investable_assets text DEFAULT '',
  investment_experience text DEFAULT 'some',
  account_type text DEFAULT 'taxable',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL,
  reason text NOT NULL,
  profile_fit text NOT NULL,
  estimated_impact text NOT NULL,
  estimated_cost text DEFAULT '$0',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own investor profile"
  ON investor_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investor profile"
  ON investor_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investor profile"
  ON investor_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity"
  ON activity_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own and global documents"
  ON documents FOR SELECT TO authenticated
  USING (is_global = true OR auth.uid() = user_id);
