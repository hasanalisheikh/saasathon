-- Fix handle_new_user trigger: add SET search_path = public (required for SECURITY DEFINER
-- functions in Supabase when the target table has RLS enabled) and ON CONFLICT DO NOTHING
-- so the app-level upsert in auth.ts can coexist without collisions.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
