-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_item_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: get school_id from logged in staff
CREATE OR REPLACE FUNCTION get_staff_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM staff WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: get school_id from logged in student
CREATE OR REPLACE FUNCTION get_student_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM students WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: get staff role
CREATE OR REPLACE FUNCTION get_staff_role()
RETURNS TEXT AS $$
  SELECT role FROM staff WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: check if user is admin or bursar
CREATE OR REPLACE FUNCTION is_admin_or_bursar()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_id = auth.uid() 
    AND role IN ('admin', 'bursar')
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_id = auth.uid() 
    AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- ========================
-- SCHOOLS
-- ========================
CREATE POLICY "Staff can view their own school"
  ON schools FOR SELECT
  USING (id = get_staff_school_id());

CREATE POLICY "Admin can update their school"
  ON schools FOR UPDATE
  USING (id = get_staff_school_id() AND is_admin());

-- ========================
-- SESSIONS
-- ========================
CREATE POLICY "Staff can view their school sessions"
  ON sessions FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view their school sessions"
  ON sessions FOR SELECT
  USING (school_id = get_student_school_id());

CREATE POLICY "Admin can manage sessions"
  ON sessions FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin());

-- ========================
-- TERMS
-- ========================
CREATE POLICY "Staff can view their school terms"
  ON terms FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view their school terms"
  ON terms FOR SELECT
  USING (school_id = get_student_school_id());

CREATE POLICY "Admin can manage terms"
  ON terms FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin());

-- ========================
-- STAFF
-- ========================
CREATE POLICY "Staff can view colleagues in same school"
  ON staff FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Admin can manage staff"
  ON staff FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin());

-- ========================
-- CLASSES
-- ========================
CREATE POLICY "Staff can view their school classes"
  ON classes FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view their school classes"
  ON classes FOR SELECT
  USING (school_id = get_student_school_id());

CREATE POLICY "Admin can manage classes"
  ON classes FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin());

-- ========================
-- SUBJECTS
-- ========================
CREATE POLICY "Staff can view their school subjects"
  ON subjects FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view their school subjects"
  ON subjects FOR SELECT
  USING (school_id = get_student_school_id());

CREATE POLICY "Admin can manage subjects"
  ON subjects FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin());

-- ========================
-- SUBJECT ASSIGNMENTS
-- ========================
CREATE POLICY "Staff can view subject assignments in their school"
  ON subject_assignments FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view subject assignments in their school"
  ON subject_assignments FOR SELECT
  USING (school_id = get_student_school_id());

CREATE POLICY "Admin can manage subject assignments"
  ON subject_assignments FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin());

-- ========================
-- STUDENTS
-- ========================
CREATE POLICY "Staff can view students in their school"
  ON students FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view their own record"
  ON students FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Students can update their own profile"
  ON students FOR UPDATE
  USING (auth_id = auth.uid());

CREATE POLICY "Admin can manage students"
  ON students FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin());

-- ========================
-- PARENTS
-- ========================
CREATE POLICY "Parents can view their own record"
  ON parents FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Parents can update their own record"
  ON parents FOR UPDATE
  USING (auth_id = auth.uid());

-- ========================
-- PARENT STUDENTS
-- ========================
CREATE POLICY "Parents can view their own links"
  ON parent_students FOR SELECT
  USING (parent_id IN (SELECT id FROM parents WHERE auth_id = auth.uid()));

CREATE POLICY "Staff can view parent links in their school"
  ON parent_students FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE school_id = get_staff_school_id()));

-- ========================
-- RESULTS
-- ========================
CREATE POLICY "Teachers can view results in their school"
  ON results FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Teachers can insert results for their assignments"
  ON results FOR INSERT
  WITH CHECK (school_id = get_staff_school_id());

CREATE POLICY "Teachers can update unpublished results"
  ON results FOR UPDATE
  USING (
    school_id = get_staff_school_id()
    AND (is_published = false OR is_admin())
  );

CREATE POLICY "Students can view their own published results"
  ON results FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
    AND is_published = true
  );

CREATE POLICY "Parents can view their children published results"
  ON results FOR SELECT
  USING (
    student_id IN (
      SELECT ps.student_id FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.auth_id = auth.uid()
    )
    AND is_published = true
  );

-- ========================
-- RESULT AUDIT LOGS
-- ========================
CREATE POLICY "Admin can view audit logs"
  ON result_audit_logs FOR SELECT
  USING (school_id = get_staff_school_id() AND is_admin());

CREATE POLICY "System can insert audit logs"
  ON result_audit_logs FOR INSERT
  WITH CHECK (school_id = get_staff_school_id());

-- ========================
-- ATTENDANCE
-- ========================
CREATE POLICY "Staff can view attendance in their school"
  ON attendance FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Teachers can mark attendance"
  ON attendance FOR INSERT
  WITH CHECK (school_id = get_staff_school_id());

CREATE POLICY "Teachers can update attendance"
  ON attendance FOR UPDATE
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view their own attendance"
  ON attendance FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE auth_id = auth.uid()));

CREATE POLICY "Parents can view their children attendance"
  ON attendance FOR SELECT
  USING (
    student_id IN (
      SELECT ps.student_id FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.auth_id = auth.uid()
    )
  );

-- ========================
-- FEE ITEMS
-- ========================
CREATE POLICY "Staff can view fee items in their school"
  ON fee_items FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view fee items in their school"
  ON fee_items FOR SELECT
  USING (school_id = get_student_school_id());

CREATE POLICY "Admin and bursar can manage fee items"
  ON fee_items FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin_or_bursar());

-- ========================
-- FEE ITEM CLASSES
-- ========================
CREATE POLICY "Staff can view fee item classes"
  ON fee_item_classes FOR SELECT
  USING (fee_item_id IN (SELECT id FROM fee_items WHERE school_id = get_staff_school_id()));

CREATE POLICY "Admin and bursar can manage fee item classes"
  ON fee_item_classes FOR ALL
  USING (fee_item_id IN (
    SELECT id FROM fee_items 
    WHERE school_id = get_staff_school_id() AND is_admin_or_bursar()
  ));

-- ========================
-- PAYMENTS
-- ========================
CREATE POLICY "Staff can view payments in their school"
  ON payments FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view their own payments"
  ON payments FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE auth_id = auth.uid()));

CREATE POLICY "Parents can view their children payments"
  ON payments FOR SELECT
  USING (
    student_id IN (
      SELECT ps.student_id FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.auth_id = auth.uid()
    )
  );

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  WITH CHECK (school_id = get_staff_school_id() OR true);

-- ========================
-- GUEST PAYMENT LINKS
-- ========================
CREATE POLICY "Staff can manage guest payment links"
  ON guest_payment_links FOR ALL
  USING (school_id = get_staff_school_id());

CREATE POLICY "Anyone can view valid guest payment links"
  ON guest_payment_links FOR SELECT
  USING (is_used = false AND expires_at > NOW());

-- ========================
-- ANNOUNCEMENTS
-- ========================
CREATE POLICY "Staff can view announcements in their school"
  ON announcements FOR SELECT
  USING (school_id = get_staff_school_id());

CREATE POLICY "Students can view announcements in their school"
  ON announcements FOR SELECT
  USING (school_id = get_student_school_id());

CREATE POLICY "Parents can view announcements for their children school"
  ON announcements FOR SELECT
  USING (
    school_id IN (
      SELECT s.school_id FROM students s
      JOIN parent_students ps ON ps.student_id = s.id
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.auth_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage announcements"
  ON announcements FOR ALL
  USING (school_id = get_staff_school_id() AND is_admin());

-- ========================
-- NOTIFICATIONS
-- ========================
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());