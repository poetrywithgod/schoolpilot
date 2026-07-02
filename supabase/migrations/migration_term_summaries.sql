-- Term Summaries: one row per student per term, holding the data that's
-- meaningful at the WHOLE-TERM level rather than per-subject — overall
-- average, class position, and remarks. Computed once (via
-- calculateTermSummaries) after a teacher/admin finalizes published results
-- for a class+term, not recalculated on every report card print.
CREATE TABLE term_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  total_score NUMERIC(7,2) NOT NULL DEFAULT 0,
  average_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  subjects_count INTEGER NOT NULL DEFAULT 0,
  class_position INTEGER,
  total_students_in_class INTEGER,
  class_teacher_remark TEXT,
  head_teacher_remark TEXT,
  is_finalized BOOLEAN DEFAULT false,
  calculated_at TIMESTAMPTZ,
  calculated_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term_id)
);

CREATE TRIGGER term_summaries_updated_at
  BEFORE UPDATE ON term_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_term_summaries_school_id ON term_summaries(school_id);
CREATE INDEX idx_term_summaries_class_term ON term_summaries(class_id, term_id);
CREATE INDEX idx_term_summaries_student_id ON term_summaries(student_id);