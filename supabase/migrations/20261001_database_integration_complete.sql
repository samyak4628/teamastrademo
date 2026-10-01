-- ==============================================================================
-- ResQFood Database, Registration & Profile Integration Migration
-- File: supabase/migrations/20261001_database_integration_complete.sql
-- Description:
-- 1. Updates profiles table with address and city columns
-- 2. Ensures restaurants, ngos, and volunteers tables have complete foreign keys (owner_id / profile_id)
-- 3. Creates volunteers table linked to public.profiles(id)
-- 4. Creates volunteer_locations table for live GPS tracking
-- 5. Configures idempotent triggers for auth.users registration
-- 6. Configures Row Level Security (RLS) policies for all role tables
-- 7. Enables Realtime replication for donations, assignments, and locations
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE UPDATES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('restaurant', 'ngo', 'volunteer', 'enterprise', 'admin')),
  full_name TEXT NOT NULL,
  organization_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT DEFAULT 'New Delhi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure address and city columns exist on existing table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'New Delhi';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- ------------------------------------------------------------------------------
-- 2. RESTAURANTS TABLE UPDATES
-- ------------------------------------------------------------------------------
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

-- Add missing columns for compatibility with both owner_id and profile_id
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS restaurant_name TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Sync owner_id with profile_id where missing
UPDATE public.restaurants SET owner_id = profile_id WHERE owner_id IS NULL;
UPDATE public.restaurants SET restaurant_name = name WHERE restaurant_name IS NULL;
UPDATE public.restaurants SET business_phone = contact_phone WHERE business_phone IS NULL;

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON public.restaurants;
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Restaurant owners can insert their restaurant" ON public.restaurants;
CREATE POLICY "Restaurant owners can insert their restaurant" ON public.restaurants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Restaurant owners can update their restaurant" ON public.restaurants;
CREATE POLICY "Restaurant owners can update their restaurant" ON public.restaurants
  FOR UPDATE TO authenticated USING (auth.uid() = profile_id OR auth.uid() = owner_id);


-- ------------------------------------------------------------------------------
-- 3. NGOS TABLE UPDATES
-- ------------------------------------------------------------------------------
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
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns for compatibility
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 50;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Sync owner_id with profile_id where missing
UPDATE public.ngos SET owner_id = profile_id WHERE owner_id IS NULL;
UPDATE public.ngos SET organization_name = name WHERE organization_name IS NULL;
UPDATE public.ngos SET capacity = beneficiary_capacity WHERE capacity IS NULL;

ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "NGOs are viewable by everyone" ON public.ngos;
CREATE POLICY "NGOs are viewable by everyone" ON public.ngos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "NGO owners can insert their organization" ON public.ngos;
CREATE POLICY "NGO owners can insert their organization" ON public.ngos
  FOR INSERT WITH CHECK (auth.uid() = profile_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "NGO owners can update their organization" ON public.ngos;
CREATE POLICY "NGO owners can update their organization" ON public.ngos
  FOR UPDATE USING (auth.uid() = profile_id OR auth.uid() = owner_id);


-- ------------------------------------------------------------------------------
-- 4. VOLUNTEERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT DEFAULT 'Bicycle / Courier',
  availability_status TEXT DEFAULT 'available',
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Volunteers are viewable by authenticated users" ON public.volunteers;
DROP POLICY IF EXISTS "Volunteers are viewable by everyone" ON public.volunteers;
CREATE POLICY "Volunteers are viewable by authenticated users" ON public.volunteers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Volunteers can insert their profile" ON public.volunteers;
CREATE POLICY "Volunteers can insert their profile" ON public.volunteers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "Volunteers can update their profile" ON public.volunteers;
CREATE POLICY "Volunteers can update their profile" ON public.volunteers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = profile_id);


-- ------------------------------------------------------------------------------
-- 5. DONATIONS & ASSIGNMENTS TABLE UPDATES
-- ------------------------------------------------------------------------------
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

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public donations read" ON public.donations;
CREATE POLICY "Public donations read" ON public.donations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Donations insert by creator" ON public.donations;
CREATE POLICY "Donations insert by creator" ON public.donations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Donations update by participants" ON public.donations;
CREATE POLICY "Donations update by participants" ON public.donations
  FOR UPDATE TO authenticated USING (
    -- Restaurant creator can update anything
    auth.uid() = created_by
    -- NGOs can update reservation status
    OR auth.uid() IN (SELECT profile_id FROM public.ngos WHERE id = donations.reserved_by_ngo OR owner_id = auth.uid())
    -- Assigned volunteers can update delivery status
    OR auth.uid() = assigned_volunteer
    -- Available donations can be reserved by authenticated users
    OR (status = 'available' AND auth.uid() IS NOT NULL)
  );

-- Volunteer Assignments table
CREATE TABLE IF NOT EXISTS public.volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  pickup_confirmed_at TIMESTAMPTZ,
  delivery_confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(donation_id, volunteer_id)
);

ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Assignments viewable by participants" ON public.volunteer_assignments;
CREATE POLICY "Assignments viewable by participants" ON public.volunteer_assignments
  FOR SELECT TO authenticated USING (
    auth.uid() = volunteer_id 
    OR auth.uid() IN (SELECT created_by FROM public.donations WHERE id = donation_id)
    OR auth.uid() IN (
      SELECT n.profile_id FROM public.ngos n 
      JOIN public.donations d ON d.reserved_by_ngo = n.id 
      WHERE d.id = donation_id
    )
  );

DROP POLICY IF EXISTS "Assignments insert" ON public.volunteer_assignments;
CREATE POLICY "Assignments insert" ON public.volunteer_assignments
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = volunteer_id
  );

DROP POLICY IF EXISTS "Assignments update" ON public.volunteer_assignments;
CREATE POLICY "Assignments update" ON public.volunteer_assignments
  FOR UPDATE TO authenticated USING (
    auth.uid() = volunteer_id
    OR auth.uid() IN (SELECT created_by FROM public.donations WHERE id = donation_id)
  );


-- ------------------------------------------------------------------------------
-- 6. VOLUNTEER LOCATIONS TABLE (Real-time GPS Tracking)
-- ------------------------------------------------------------------------------
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

DROP POLICY IF EXISTS "Authorized participants view delivery locations" ON public.volunteer_locations;
DROP POLICY IF EXISTS "Public read volunteer locations" ON public.volunteer_locations;
CREATE POLICY "Authorized participants view delivery locations" ON public.volunteer_locations
  FOR SELECT TO authenticated USING (
    auth.uid()::text = volunteer_id
    OR EXISTS (
      SELECT 1 FROM public.donations d
      WHERE d.id::text = volunteer_locations.donation_id
        AND (
          d.created_by = auth.uid()
          OR d.assigned_volunteer = auth.uid()
          OR d.reserved_by_ngo IN (SELECT id FROM public.ngos WHERE profile_id = auth.uid() OR owner_id = auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Allow upsert volunteer locations" ON public.volunteer_locations;
DROP POLICY IF EXISTS "Volunteers insert own location" ON public.volunteer_locations;
CREATE POLICY "Volunteers insert own location" ON public.volunteer_locations
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid()::text = volunteer_id
  );

DROP POLICY IF EXISTS "Volunteers update own location" ON public.volunteer_locations;
CREATE POLICY "Volunteers update own location" ON public.volunteer_locations
  FOR UPDATE TO authenticated USING (
    auth.uid()::text = volunteer_id
  );


-- ------------------------------------------------------------------------------
-- 7. AUTOMATIC USER & ROLE PROVISIONING TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_org_name TEXT;
  v_phone TEXT;
  v_address TEXT;
  v_city TEXT;
BEGIN
  -- Extract metadata safely
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'restaurant');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_org_name := COALESCE(new.raw_user_meta_data->>'organization_name', v_full_name);
  v_phone := new.raw_user_meta_data->>'phone';
  v_address := COALESCE(new.raw_user_meta_data->>'address', 'Main Sector');
  v_city := COALESCE(new.raw_user_meta_data->>'city', 'New Delhi');

  -- 1. Insert or update public.profiles
  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    organization_name,
    phone,
    avatar_url,
    address,
    city,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    v_role,
    v_full_name,
    v_org_name,
    v_phone,
    new.raw_user_meta_data->>'avatar_url',
    v_address,
    v_city,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    organization_name = EXCLUDED.organization_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    updated_at = NOW();

  -- 2. Role-specific provisioning
  IF v_role = 'restaurant' THEN
    INSERT INTO public.restaurants (
      profile_id,
      owner_id,
      name,
      restaurant_name,
      address,
      city,
      contact_phone,
      business_phone,
      verification_status,
      verified
    )
    VALUES (
      new.id,
      new.id,
      v_org_name,
      v_org_name,
      v_address,
      v_city,
      v_phone,
      v_phone,
      'pending',
      FALSE
    )
    ON CONFLICT DO NOTHING;

  ELSIF v_role = 'ngo' THEN
    INSERT INTO public.ngos (
      profile_id,
      owner_id,
      name,
      organization_name,
      address,
      city,
      contact_phone,
      beneficiary_capacity,
      capacity,
      verification_status,
      verified
    )
    VALUES (
      new.id,
      new.id,
      v_org_name,
      v_org_name,
      v_address,
      v_city,
      v_phone,
      50,
      50,
      'pending',
      FALSE
    )
    ON CONFLICT DO NOTHING;

  ELSIF v_role = 'volunteer' THEN
    INSERT INTO public.volunteers (
      user_id,
      profile_id,
      vehicle_type,
      availability_status,
      verification_status
    )
    VALUES (
      new.id,
      new.id,
      COALESCE(new.raw_user_meta_data->>'vehicle_type', 'Bicycle / Courier'),
      'available',
      'pending'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------------------------
-- 8. REALTIME REPLICATION CONFIGURATION
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_locations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_assignments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ngos;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
