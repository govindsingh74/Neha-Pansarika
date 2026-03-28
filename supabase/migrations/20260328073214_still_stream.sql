/*
  # Contact and Support System Tables

  1. New Tables
    - `contact_inquiries` - Store contact form submissions
    - `order_tracking_requests` - Track order status requests
    - `shipping_inquiries` - Shipping related inquiries
    - `cancellation_requests` - Order cancellation/return requests
    - `refund_tracking` - Refund status tracking
    - `support_tickets` - General support tickets (already exists, will enhance)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public users to create contact inquiries

  3. Functions
    - Auto-generate reference numbers
    - Update timestamps
*/

-- Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  inquiry_type text DEFAULT 'general' CHECK (inquiry_type IN ('general', 'product', 'order', 'delivery', 'payment', 'technical', 'complaint', 'suggestion')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  user_id uuid,
  admin_response text,
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Tracking Requests Table
CREATE TABLE IF NOT EXISTS order_tracking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL,
  order_number text NOT NULL,
  email text NOT NULL,
  phone text,
  user_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'found', 'not_found', 'invalid')),
  order_details jsonb,
  tracking_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipping Inquiries Table
CREATE TABLE IF NOT EXISTS shipping_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL,
  inquiry_type text NOT NULL CHECK (inquiry_type IN ('delivery_time', 'shipping_cost', 'delivery_area', 'delivery_issue', 'address_change', 'delivery_instructions')),
  order_number text,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  user_id uuid,
  admin_response text,
  estimated_resolution timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cancellation Requests Table
CREATE TABLE IF NOT EXISTS cancellation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('cancel_order', 'return_item', 'exchange_item')),
  order_number text NOT NULL,
  order_item_ids uuid[],
  reason text NOT NULL,
  reason_category text CHECK (reason_category IN ('changed_mind', 'wrong_item', 'damaged_item', 'late_delivery', 'quality_issue', 'size_issue', 'other')),
  description text,
  images text[],
  refund_method text CHECK (refund_method IN ('original_payment', 'wallet', 'bank_transfer')),
  refund_amount numeric(10,2),
  user_id uuid NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled')),
  admin_notes text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Refund Tracking (extending existing table)
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS reference_number text;
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS tracking_status text DEFAULT 'initiated' CHECK (tracking_status IN ('initiated', 'processing', 'approved', 'transferred', 'completed', 'failed'));
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS expected_completion_date timestamptz;
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS bank_details jsonb;
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS transaction_reference text;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_reference ON contact_inquiries(reference_number);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_user_id ON contact_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at);

CREATE INDEX IF NOT EXISTS idx_order_tracking_reference ON order_tracking_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_number ON order_tracking_requests(order_number);
CREATE INDEX IF NOT EXISTS idx_order_tracking_email ON order_tracking_requests(email);

CREATE INDEX IF NOT EXISTS idx_shipping_inquiries_reference ON shipping_inquiries(reference_number);
CREATE INDEX IF NOT EXISTS idx_shipping_inquiries_user_id ON shipping_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_inquiries_status ON shipping_inquiries(status);

CREATE INDEX IF NOT EXISTS idx_cancellation_requests_reference ON cancellation_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_user_id ON cancellation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_order_number ON cancellation_requests(order_number);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_status ON cancellation_requests(status);

-- Create unique index for refund reference numbers
CREATE UNIQUE INDEX IF NOT EXISTS idx_refunds_reference_number ON refunds(reference_number) WHERE reference_number IS NOT NULL;

-- Functions for generating reference numbers
CREATE OR REPLACE FUNCTION generate_contact_reference()
RETURNS text AS $$
BEGIN
  RETURN 'CNT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_tracking_reference()
RETURNS text AS $$
BEGIN
  RETURN 'TRK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_shipping_reference()
RETURNS text AS $$
BEGIN
  RETURN 'SHP' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_cancellation_reference()
RETURNS text AS $$
BEGIN
  RETURN 'CAN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_refund_reference()
RETURNS text AS $$
BEGIN
  RETURN 'REF' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-generating reference numbers
CREATE OR REPLACE FUNCTION set_contact_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := generate_contact_reference();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_tracking_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := generate_tracking_reference();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_shipping_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := generate_shipping_reference();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_cancellation_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := generate_cancellation_reference();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_refund_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := generate_refund_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER contact_inquiries_reference_trigger
  BEFORE INSERT OR UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION set_contact_reference();

CREATE TRIGGER order_tracking_reference_trigger
  BEFORE INSERT OR UPDATE ON order_tracking_requests
  FOR EACH ROW EXECUTE FUNCTION set_tracking_reference();

CREATE TRIGGER shipping_inquiries_reference_trigger
  BEFORE INSERT OR UPDATE ON shipping_inquiries
  FOR EACH ROW EXECUTE FUNCTION set_shipping_reference();

CREATE TRIGGER cancellation_requests_reference_trigger
  BEFORE INSERT OR UPDATE ON cancellation_requests
  FOR EACH ROW EXECUTE FUNCTION set_cancellation_reference();

CREATE TRIGGER refunds_reference_trigger
  BEFORE INSERT OR UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION set_refund_reference();

-- Enable RLS
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_inquiries
CREATE POLICY "Anyone can create contact inquiries"
  ON contact_inquiries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own contact inquiries"
  ON contact_inquiries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own contact inquiries"
  ON contact_inquiries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for order_tracking_requests
CREATE POLICY "Anyone can create order tracking requests"
  ON order_tracking_requests FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own tracking requests"
  ON order_tracking_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for shipping_inquiries
CREATE POLICY "Anyone can create shipping inquiries"
  ON shipping_inquiries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own shipping inquiries"
  ON shipping_inquiries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own shipping inquiries"
  ON shipping_inquiries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for cancellation_requests
CREATE POLICY "Users can create cancellation requests"
  ON cancellation_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own cancellation requests"
  ON cancellation_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own cancellation requests"
  ON cancellation_requests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());