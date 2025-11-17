-- Add policy to allow admins to view all users
CREATE POLICY "Admins can view all users"
ON "Users"
FOR SELECT
TO authenticated
USING (is_admin());