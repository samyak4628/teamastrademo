-- ==============================================================================
-- ResQFood Initial Production Database Schema & Security Policies
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('restaurant', 'ngo', 'volunteer', 'enterprise', 'admin')),
  full_name TEXT NOT NULL,
  organization_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuisine_type TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  contact_phone TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NGOS TABLE
CREATE TABLE IF NOT EXISTS public.ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reg_number TEXT,
  beneficiary_capacity INT DEFAULT 50,
  dietary_preferences TEXT[] DEFAULT '{}',
  operating_hours TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  food_category TEXT NOT NULL CHECK (food_category IN ('Cooked Meals', 'Bakery & Bread', 'Fresh Produce', 'Dairy & Refrigerated', 'Packaged Goods', 'Beverages')),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL CHECK (unit IN ('servings', 'kg', 'meals', 'boxes', 'trays', 'liters')),
  description TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  photo_url TEXT,
  prep_time TIMESTAMPTZ,
  pickup_window_start TIMESTAMPTZ NOT NULL,
  pickup_window_end TIMESTAMPTZ NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('draft', 'available', 'reserved', 'volunteer_assigned', 'picked_up', 'on_the_way', 'delivered', 'completed', 'cancelled', 'expired')),
  reserved_by_ngo UUID REFERENCES public.ngos(id) ON DELETE SET NULL,
  assigned_volunteer UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DONATION RESPONSES (NGO Claims / Responses)
CREATE TABLE IF NOT EXISTS public.donation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(donation_id, ngo_id)
);

-- 6. VOLUNTEER ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  pickup_confirmed_at TIMESTAMPTZ,
  delivery_confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(donation_id, volunteer_id)
);

-- 7. DONATION AUDIT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.donation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('donation_available', 'donation_accepted', 'volunteer_assigned', 'pickup_reminder', 'picked_up', 'delivered', 'cancelled')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ATOMIC TRANSACTION SAFEGUARD: NGO CLAIM FUNCTION
-- ==============================================================================
-- Prevents race conditions where two NGOs try to reserve the same donation simultaneously.
CREATE OR REPLACE FUNCTION public.reserve_donation(
  p_donation_id UUID,
  p_ngo_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donation public.donations%ROWTYPE;
BEGIN
  -- Acquire row-level lock on the donation
  SELECT * INTO v_donation
  FROM public.donations
  WHERE id = p_donation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Donation not found');
  END IF;

  IF v_donation.status != 'available' THEN
    RETURN jsonb_build_object('success', false, 'error', 'This donation is no longer available (current status: ' || v_donation.status || ')');
  END IF;

  -- Update donation status atomically
  UPDATE public.donations
  SET status = 'reserved',
      reserved_by_ngo = p_ngo_id,
      updated_at = NOW()
  WHERE id = p_donation_id;

  -- Record acceptance response
  INSERT INTO public.donation_responses (donation_id, ngo_id, status)
  VALUES (p_donation_id, p_ngo_id, 'accepted')
  ON CONFLICT (donation_id, ngo_id)
  DO UPDATE SET status = 'accepted';

  -- Create audit event
  INSERT INTO public.donation_events (donation_id, action, details)
  VALUES (p_donation_id, 'donation_reserved', jsonb_build_object('ngo_id', p_ngo_id));

  RETURN jsonb_build_object('success', true, 'status', 'reserved');
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Public profile read" ON public.profiles;
CREATE POLICY "Public profile read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Restaurants
DROP POLICY IF EXISTS "Public restaurant read" ON public.restaurants;
CREATE POLICY "Public restaurant read" ON public.restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners insert restaurant" ON public.restaurants;
CREATE POLICY "Owners insert restaurant" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Owners update restaurant" ON public.restaurants;
CREATE POLICY "Owners update restaurant" ON public.restaurants FOR UPDATE USING (auth.uid() = profile_id);

-- NGOs
DROP POLICY IF EXISTS "Public ngo read" ON public.ngos;
CREATE POLICY "Public ngo read" ON public.ngos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners insert ngo" ON public.ngos;
CREATE POLICY "Owners insert ngo" ON public.ngos FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Owners update ngo" ON public.ngos;
CREATE POLICY "Owners update ngo" ON public.ngos FOR UPDATE USING (auth.uid() = profile_id);

-- Donations
DROP POLICY IF EXISTS "View donations" ON public.donations;
CREATE POLICY "View donations" ON public.donations FOR SELECT
  USING (
    status IN ('available', 'reserved', 'volunteer_assigned', 'picked_up', 'on_the_way', 'delivered', 'completed')
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Create donations" ON public.donations;
CREATE POLICY "Create donations" ON public.donations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Update owned donations" ON public.donations;
CREATE POLICY "Update owned donations" ON public.donations FOR UPDATE
  USING (auth.uid() = created_by);

-- Volunteer Assignments
DROP POLICY IF EXISTS "Volunteers view assigned tasks" ON public.volunteer_assignments;
CREATE POLICY "Volunteers view assigned tasks" ON public.volunteer_assignments FOR SELECT
  USING (volunteer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.donations d WHERE d.id = donation_id AND d.created_by = auth.uid()
  ));

DROP POLICY IF EXISTS "Volunteers update assigned tasks" ON public.volunteer_assignments;
CREATE POLICY "Volunteers update assigned tasks" ON public.volunteer_assignments FOR UPDATE
  USING (volunteer_id = auth.uid());

-- Notifications
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid());
