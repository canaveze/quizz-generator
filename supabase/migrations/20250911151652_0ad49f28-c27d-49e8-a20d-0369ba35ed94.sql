-- Enable Row Level Security on auth schema (this is handled by Supabase)
-- But we need to ensure we have proper triggers for user creation

-- Create a function to handle new user creation and profile management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_legacy_id BIGINT;
BEGIN
  -- Get next available legacy ID
  SELECT COALESCE(MAX(user_id), 0) + 1 INTO next_legacy_id FROM public."Users";
  
  -- Create profile record
  INSERT INTO public.profiles (id, user_legacy_id, name, email)
  VALUES (NEW.id, next_legacy_id, NEW.raw_user_meta_data->>'name', NEW.email)
  ON CONFLICT (id) DO UPDATE SET
    user_legacy_id = next_legacy_id,
    name = NEW.raw_user_meta_data->>'name',
    email = NEW.email;
    
  -- Create user record in Users table
  INSERT INTO public."Users" (user_id, name, email)
  VALUES (next_legacy_id, NEW.raw_user_meta_data->>'name', NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET
    name = NEW.raw_user_meta_data->>'name',
    email = NEW.email;
    
  RETURN NEW;
END;
$$;

-- Create trigger to automatically handle new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();