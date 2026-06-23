-- Classes (e.g. JSS1, SS2)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('JSS1','JSS2','JSS3','SS1','SS2','SS3')),
  arm TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subject assignments (teacher → subject → class)
CREATE TABLE subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, class_id, term_id)
);

CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_session_id ON classes(session_id);
CREATE INDEX idx_subjects_school_id ON subjects(school_id);
CREATE INDEX idx_subject_assignments_staff_id ON subject_assignments(staff_id);
CREATE INDEX idx_subject_assignments_class_id ON subject_assignments(class_id);