/*
  # Pansarika Grocery Platform Database Schema

  1. New Tables
    - `categories` - Product categories
    - `products` - Product catalog with pricing, offers, deals
    - `offers` - Special offers and promotions
    - `brands` - Product brands
    - `cart_items` - User shopping cart
    - `orders` - Order management
    - `order_items` - Order line items
    - `user_addresses` - User delivery addresses

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure cart and order access per user
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  image_url text,
  images text[] DEFAULT '{}',
  category_id uuid REFERENCES categories(id),
  brand_id uuid REFERENCES brands(id),
  stock_quantity integer DEFAULT 0,
  unit text DEFAULT 'piece',
  weight text,
  is_featured boolean DEFAULT false,
  is_best_deal boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  discount_percentage integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  nutritional_info jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed', 'buy_get')) DEFAULT 'percentage',
  discount_value decimal(10,2) NOT NULL,
  min_order_amount decimal(10,2) DEFAULT 0,
  max_discount decimal(10,2),
  image_url text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  usage_limit integer,
  used_count integer DEFAULT 0,
  applicable_products uuid[] DEFAULT '{}',
  applicable_categories uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'India',
  latitude decimal(10,8),
  longitude decimal(11,8),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_number text UNIQUE NOT NULL,
  status text CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')) DEFAULT 'pending',
  payment_status text CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method text,
  payment_id text,
  subtotal decimal(10,2) NOT NULL,
  delivery_fee decimal(10,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  delivery_address jsonb NOT NULL,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public read access for categories, brands, products, offers
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Brands are publicly readable"
  ON brands FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Offers are publicly readable"
  ON offers FOR SELECT
  TO public
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

-- User-specific policies
CREATE POLICY "Users can manage their addresses"
  ON user_addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their cart items"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- Functions for cart operations
CREATE OR REPLACE FUNCTION update_cart_item_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_items_timestamp
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_item_timestamp();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
BEGIN
  new_number := 'PN' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;