-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  auth_id UUID UNIQUE,
  reg_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  address TEXT,
  photo_url TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  parent_linking_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, reg_number)
);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_reg_number ON students(reg_number);
CREATE INDEX idx_students_auth_id ON students(auth_id);