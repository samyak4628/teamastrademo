-- ==============================================================================
-- ResQFood Volunteer Real-Time Locations & GPS Tracking Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.volunteer_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.volunteer_assignments(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  accuracy NUMERIC(8, 2), -- in meters
  heading NUMERIC(5, 2),  -- degrees relative to true north
  speed NUMERIC(5, 2),    -- meters per second
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_assignment_location UNIQUE (assignment_id)
);

-- Index for real-time lookups
CREATE INDEX IF NOT EXISTS idx_volunteer_locations_assignment 
  ON public.volunteer_locations(assignment_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_locations_donation 
  ON public.volunteer_locations(donation_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.volunteer_locations ENABLE ROW LEVEL SECURITY;

-- 1. READ POLICY:
-- Authorized parties associated with the delivery can view the live location:
-- (a) The volunteer themselves
-- (b) The NGO that reserved the food batch
-- (c) The restaurant owner who posted the food batch
CREATE POLICY "Authorized delivery parties can read live location"
  ON public.volunteer_locations FOR SELECT
  USING (
    -- Volunteer themselves
    auth.uid() = volunteer_id
    OR
    -- NGO owner who claimed the donation
    EXISTS (
      SELECT 1 FROM public.donations d
      JOIN public.ngos n ON n.id = d.reserved_by_ngo
      WHERE d.id = donation_id AND n.profile_id = auth.uid()
    )
    OR
    -- Restaurant owner who created the donation
    EXISTS (
      SELECT 1 FROM public.donations d
      WHERE d.id = donation_id AND d.created_by = auth.uid()
    )
  );

-- 2. WRITE POLICY (INSERT / UPDATE):
-- Only the assigned volunteer can publish their GPS location,
-- AND only while the assignment is active (not completed or cancelled).
CREATE POLICY "Assigned volunteer updates live GPS position"
  ON public.volunteer_locations FOR INSERT
  WITH CHECK (
    auth.uid() = volunteer_id
    AND EXISTS (
      SELECT 1 FROM public.volunteer_assignments va
      WHERE va.id = assignment_id 
        AND va.volunteer_id = auth.uid()
        AND va.status IN ('assigned', 'in_progress')
    )
  );

CREATE POLICY "Assigned volunteer updates existing location"
  ON public.volunteer_locations FOR UPDATE
  USING (
    auth.uid() = volunteer_id
    AND EXISTS (
      SELECT 1 FROM public.volunteer_assignments va
      WHERE va.id = assignment_id 
        AND va.volunteer_id = auth.uid()
        AND va.status IN ('assigned', 'in_progress')
    )
  )
  WITH CHECK (
    auth.uid() = volunteer_id
  );

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_location_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_volunteer_location_updated_at ON public.volunteer_locations;
CREATE TRIGGER trigger_volunteer_location_updated_at
  BEFORE UPDATE ON public.volunteer_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_location_updated_at();

-- Add table to Realtime publication for WebSocket broadcasts
ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_locations;
