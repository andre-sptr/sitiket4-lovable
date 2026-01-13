-- Create enum for ticket status
CREATE TYPE public.ticket_status AS ENUM (
  'OPEN', 
  'ASSIGNED', 
  'ONPROGRESS', 
  'TEMPORARY', 
  'WAITING_MATERIAL', 
  'WAITING_ACCESS', 
  'WAITING_COORDINATION', 
  'CLOSED'
);

-- Create enum for TTR compliance
CREATE TYPE public.ttr_compliance AS ENUM ('COMPLY', 'NOT COMPLY');

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'TSEL',
  inc_numbers TEXT[] NOT NULL DEFAULT '{}',
  site_code TEXT NOT NULL,
  site_name TEXT NOT NULL,
  network_element TEXT,
  kategori TEXT NOT NULL,
  lokasi_text TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  jarak_km_range TEXT,
  ttr_compliance public.ttr_compliance NOT NULL DEFAULT 'COMPLY',
  jam_open TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ttr_target_hours INTEGER NOT NULL DEFAULT 24,
  max_jam_close TIMESTAMPTZ NOT NULL,
  ttr_real_hours DOUBLE PRECISION,
  sisa_ttr_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
  status public.ticket_status NOT NULL DEFAULT 'OPEN',
  is_permanent BOOLEAN NOT NULL DEFAULT FALSE,
  permanent_notes TEXT,
  penyebab TEXT,
  segmen TEXT,
  inc_gamas TEXT,
  kjd TEXT,
  teknisi_list TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  raw_ticket_text TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create progress updates table
CREATE TABLE public.progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL CHECK (source IN ('HD', 'ADMIN', 'SYSTEM')),
  message TEXT NOT NULL,
  status_after_update public.ticket_status,
  location_lat DOUBLE PRECISION,
  location_lon DOUBLE PRECISION,
  attachments TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create teknisi (technicians) table
CREATE TABLE public.teknisi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  area TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teknisi ENABLE ROW LEVEL SECURITY;

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'hd', 'guest');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  area TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets
CREATE POLICY "Everyone can view tickets" ON public.tickets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert tickets" ON public.tickets
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hd'));

CREATE POLICY "Admins can update tickets" ON public.tickets
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hd'));

CREATE POLICY "Admins can delete tickets" ON public.tickets
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for progress_updates
CREATE POLICY "Everyone can view progress updates" ON public.progress_updates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert progress updates" ON public.progress_updates
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for teknisi
CREATE POLICY "Everyone can view teknisi" ON public.teknisi
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage teknisi" ON public.teknisi
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teknisi_updated_at
  BEFORE UPDATE ON public.teknisi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tickets and progress_updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.progress_updates;