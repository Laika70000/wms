/*
  # Create merchants and sources tables
  
  1. New Tables
    - `merchants`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `created_at` (timestamptz)
    
    - `sources`
      - `id` (uuid, primary key)
      - `merchant_id` (uuid, foreign key to merchants)
      - `platform` (text, enum: shopify/amazon)
      - `name` (text)
      - `api_key` (text)
      - `api_secret` (text)
      - `shop_url` (text, required for Shopify)
      - `status` (text, enum: pending/active/error)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for merchants to manage their own sources
*/

-- Create merchants table
CREATE TABLE merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on merchants
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Create sources table
CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  platform text NOT NULL CHECK (platform IN ('shopify', 'amazon')),
  name text NOT NULL,
  api_key text NOT NULL,
  api_secret text NOT NULL,
  shop_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error')),
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT sources_shop_url_required_for_shopify 
    CHECK (
      (platform = 'shopify' AND shop_url IS NOT NULL) OR 
      (platform = 'amazon' AND shop_url IS NULL)
    )
);

-- Enable RLS on sources
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Create policies for sources
CREATE POLICY "Merchants can read own sources"
  ON sources
  FOR SELECT
  TO authenticated
  USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can insert own sources"
  ON sources
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update own sources"
  ON sources
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete own sources"
  ON sources
  FOR DELETE
  TO authenticated
  USING (auth.uid() = merchant_id);