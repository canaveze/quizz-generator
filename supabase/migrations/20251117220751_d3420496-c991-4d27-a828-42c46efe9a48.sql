-- Add policy to allow admins to view all results
CREATE POLICY "Admins can view all results"
ON "Results"
FOR SELECT
TO authenticated
USING (is_admin());