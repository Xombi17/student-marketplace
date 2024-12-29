/*
  # Initial Schema for Student Marketplace

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - email (text)
      - full_name (text)
      - student_id (text)
      - is_verified (boolean)
      - created_at (timestamp)
    
    - listings
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - price (numeric)
      - category (text)
      - status (text)
      - seller_id (uuid, foreign key)
      - created_at (timestamp)
    
    - images
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - url (text)
      - created_at (timestamp)
    
    - bids
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - bidder_id (uuid, foreign key)
      - amount (numeric)
      - status (text)
      - created_at (timestamp)
    
    - messages
      - id (uuid, primary key)
      - sender_id (uuid, foreign key)
      - receiver_id (uuid, foreign key)
      - listing_id (uuid, foreign key)
      - content (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  student_id text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create listings table
CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (status IN ('pending', 'active', 'sold', 'rejected'))
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active listings"
  ON listings FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Sellers can CRUD own listings"
  ON listings FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id);

-- Create images table
CREATE TABLE images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read images"
  ON images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert images for own listings"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );

-- Create bids table
CREATE TABLE bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id uuid REFERENCES profiles(id),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CHECK (status IN ('pending', 'accepted', 'rejected'))
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read bids for visible listings"
  ON bids FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_id AND (status = 'active' OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_id AND status = 'active'
    ) AND bidder_id = auth.uid()
  );

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id),
  receiver_id uuid REFERENCES profiles(id),
  listing_id uuid REFERENCES listings(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Create necessary indexes
CREATE INDEX listings_category_idx ON listings(category);
CREATE INDEX listings_seller_id_idx ON listings(seller_id);
CREATE INDEX bids_listing_id_idx ON bids(listing_id);
CREATE INDEX messages_sender_receiver_idx ON messages(sender_id, receiver_id);
CREATE INDEX messages_listing_id_idx ON messages(listing_id);