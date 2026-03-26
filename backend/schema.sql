-- ================================================================
-- GOLF CHARITY PLATFORM — SUPABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- 1. PROFILES (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  email           TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  charity_id      UUID,                          -- FK added after charities table
  charity_percent INTEGER DEFAULT 10 CHECK (charity_percent >= 10 AND charity_percent <= 100),
  stripe_customer_id TEXT UNIQUE,
  role            TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- 2. CHARITIES
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  website     TEXT,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Now add FK from profiles to charities
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_charity
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────────
-- 3. SUBSCRIPTIONS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id     TEXT,
  plan                   TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('active', 'cancelled', 'past_due', 'pending', 'lapsed')),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN DEFAULT false,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_user
  ON subscriptions(user_id) WHERE status = 'active';

-- ────────────────────────────────────────────────────────────────
-- 4. SCORES
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user score lookups
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON scores(user_id, date DESC);

-- ────────────────────────────────────────────────────────────────
-- 5. DRAWS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draws (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month               TEXT NOT NULL,              -- e.g. "January 2025"
  draw_date           TIMESTAMPTZ NOT NULL,
  draw_type           TEXT NOT NULL DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  numbers             INTEGER[] NOT NULL,         -- array of 5 drawn numbers
  jackpot_pool        NUMERIC(10,2) DEFAULT 0,
  prize_4_pool        NUMERIC(10,2) DEFAULT 0,
  prize_3_pool        NUMERIC(10,2) DEFAULT 0,
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  jackpot_rolled_over BOOLEAN DEFAULT false,
  total_participants  INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- 6. DRAW RESULTS (one row per user per draw)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_results (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id          UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scores_at_draw   INTEGER[],       -- snapshot of user's 5 scores at draw time
  match_count      INTEGER DEFAULT 0,
  matched_numbers  INTEGER[],
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- ────────────────────────────────────────────────────────────────
-- 7. WINNERS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS winners (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id            UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_type         TEXT NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  amount             NUMERIC(10,2) NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'proof_submitted', 'approved', 'rejected', 'paid')),
  proof_url          TEXT,
  payment_reference  TEXT,
  verified_at        TIMESTAMPTZ,
  paid_at            TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- 8. DONATIONS (independent donations, not tied to subscription)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  charity_id UUID NOT NULL REFERENCES charities(id),
  amount     NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  type       TEXT DEFAULT 'independent' CHECK (type IN ('subscription', 'independent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- 9. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws         ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners       ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations     ENABLE ROW LEVEL SECURITY;

-- profiles: users see only their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- subscriptions: users see only their own
CREATE POLICY "Users see own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- scores: users see + manage only their own
CREATE POLICY "Users see own scores"
  ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scores"
  ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own scores"
  ON scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own scores"
  ON scores FOR DELETE USING (auth.uid() = user_id);

-- charities: public read
CREATE POLICY "Public can read charities"
  ON charities FOR SELECT USING (is_active = true);

-- draws: public read for published
CREATE POLICY "Public can view published draws"
  ON draws FOR SELECT USING (status = 'published');

-- draw_results: users see their own
CREATE POLICY "Users see own draw results"
  ON draw_results FOR SELECT USING (auth.uid() = user_id);

-- winners: users see their own
CREATE POLICY "Users see own winnings"
  ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload proof"
  ON winners FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- donations: users see their own
CREATE POLICY "Users see own donations"
  ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can donate"
  ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- 10. SEED DATA — Sample charities
-- ────────────────────────────────────────────────────────────────
INSERT INTO charities (name, category, description, website) VALUES
  ('Cancer Research UK', 'Health', 'Funding breakthrough cancer research and treatments across the UK.', 'https://www.cancerresearchuk.org'),
  ('Action for Children', 'Youth', 'Protecting and supporting vulnerable children and young people throughout the UK.', 'https://www.actionforchildren.org.uk'),
  ('Mind Mental Health', 'Wellbeing', 'Providing advice and support to empower anyone experiencing a mental health problem.', 'https://www.mind.org.uk'),
  ('British Heart Foundation', 'Health', 'Fighting heart and circulatory diseases that devastate families across the UK.', 'https://www.bhf.org.uk'),
  ('Age UK', 'Elderly', 'Working to improve later life for everyone through information, campaigns, and services.', 'https://www.ageuk.org.uk'),
  ('RNLI', 'Rescue', 'The charity that saves lives at sea, operating lifeboat and lifeguard services.', 'https://rnli.org'),
  ('Macmillan Cancer Support', 'Health', 'Providing physical, financial and emotional support to people living with cancer.', 'https://www.macmillan.org.uk'),
  ('Shelter', 'Housing', 'Helping millions of people facing bad housing or homelessness through advice and campaigning.', 'https://www.shelter.org.uk')
ON CONFLICT DO NOTHING;