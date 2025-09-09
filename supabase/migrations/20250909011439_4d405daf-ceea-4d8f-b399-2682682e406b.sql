-- Add RLS policy for Users table (legacy table without policies)
CREATE POLICY "Users can view own user record" ON public."Users"
FOR SELECT USING (user_id = public.get_current_user_legacy_id());

CREATE POLICY "Users can create own user record" ON public."Users"
FOR INSERT WITH CHECK (user_id = public.get_current_user_legacy_id());

CREATE POLICY "Users can update own user record" ON public."Users"
FOR UPDATE USING (user_id = public.get_current_user_legacy_id());