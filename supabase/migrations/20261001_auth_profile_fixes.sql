-- ==============================================================================
-- ResQFood Auth, Profile & Role-Based Security Migration
-- ==============================================================================

-- 1. Ensure profiles table has proper RLS policies for INSERT, SELECT, and UPDATE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profile read" ON public.profiles;
CREATE POLICY "Public profile read" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Automatic Profile Trigger on Auth User Creation
-- Captures metadata (full_name, role, organization_name, phone) provided during signUp()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    organization_name,
    phone,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'restaurant'),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'organization_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    organization_name = EXCLUDED.organization_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();

  -- If registered as restaurant, create matching restaurant record if organization_name provided
  IF (new.raw_user_meta_data->>'role') = 'restaurant' THEN
    INSERT INTO public.restaurants (
      profile_id,
      name,
      address,
      city,
      contact_phone
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'organization_name', 'Commercial Kitchen'),
      COALESCE(new.raw_user_meta_data->>'address', 'Main Sector'),
      COALESCE(new.raw_user_meta_data->>'city', 'New Delhi'),
      new.raw_user_meta_data->>'phone'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- If registered as NGO, create matching NGO record if organization_name provided
  IF (new.raw_user_meta_data->>'role') = 'ngo' THEN
    INSERT INTO public.ngos (
      profile_id,
      name,
      address,
      city,
      beneficiary_capacity
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'organization_name', 'Community Food Bank'),
      COALESCE(new.raw_user_meta_data->>'address', 'Community Center'),
      COALESCE(new.raw_user_meta_data->>'city', 'New Delhi'),
      50
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Ensure volunteer_locations table exists for Live GPS tracking
CREATE TABLE IF NOT EXISTS public.volunteer_locations (
  assignment_id TEXT PRIMARY KEY,
  volunteer_id TEXT NOT NULL,
  donation_id TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  accuracy NUMERIC(8, 2),
  heading NUMERIC(5, 2),
  speed NUMERIC(6, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.volunteer_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read volunteer locations" ON public.volunteer_locations;
CREATE POLICY "Public read volunteer locations" ON public.volunteer_locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow upsert volunteer locations" ON public.volunteer_locations;
CREATE POLICY "Allow upsert volunteer locations" ON public.volunteer_locations
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable Realtime Publications
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_locations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
