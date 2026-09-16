-- ==============================================================================
-- Supabase Free Tier PostgreSQL Schema for HabitFlow Pro
-- Includes Row Level Security (RLS) and RevenueCat Subscription Webhook Sync
-- ==============================================================================

-- 1. Users & Subscription Entitlement Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    rc_app_user_id TEXT UNIQUE,
    is_pro BOOLEAN DEFAULT FALSE,
    active_subscription_plan TEXT,
    subscription_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    streak_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_completed_at TIMESTAMPTZ
);

-- 3. Habit Completions Log
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own profile" 
ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own habits" 
ON public.habits FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own habit logs" 
ON public.habit_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())
);
