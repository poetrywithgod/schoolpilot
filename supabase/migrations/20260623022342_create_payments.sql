-- Fee items
CREATE TABLE fee_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  applies_to_all BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee item class assignments
CREATE TABLE fee_item_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_item_id UUID NOT NULL REFERENCES fee_items(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(fee_item_id, class_id)
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_item_id UUID NOT NULL REFERENCES fee_items(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  paystack_reference TEXT UNIQUE,
  paid_by TEXT,
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  is_guest_payment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest payment links
CREATE TABLE guest_payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_item_id UUID NOT NULL REFERENCES fee_items(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_school_id ON payments(school_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_guest_payment_links_token ON guest_payment_links(token);