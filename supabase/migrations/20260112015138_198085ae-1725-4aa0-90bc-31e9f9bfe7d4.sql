-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop permissive policy and create more secure one for progress_updates insert
DROP POLICY IF EXISTS "Authenticated users can insert progress updates" ON public.progress_updates;

-- Users can only insert progress updates for tickets they're assigned to or if they're admin/hd
CREATE POLICY "Users can insert own progress updates" ON public.progress_updates
  FOR INSERT TO authenticated 
  WITH CHECK (
    created_by = auth.uid() 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'hd')
  );