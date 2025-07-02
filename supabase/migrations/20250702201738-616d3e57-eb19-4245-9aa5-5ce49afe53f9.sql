
-- Create enum types for VoltMarket
CREATE TYPE voltmarket_user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE voltmarket_seller_type AS ENUM ('site_owner', 'broker', 'realtor', 'equipment_vendor');
CREATE TYPE voltmarket_listing_type AS ENUM ('site_sale', 'site_lease', 'hosting', 'equipment');
CREATE TYPE voltmarket_listing_status AS ENUM ('active', 'under_loi', 'sold', 'leased', 'inactive');
CREATE TYPE voltmarket_property_type AS ENUM ('data_center', 'industrial', 'warehouse', 'land', 'office', 'other');
CREATE TYPE voltmarket_equipment_type AS ENUM ('asic', 'gpu', 'cooling', 'generator', 'ups', 'transformer', 'other');
CREATE TYPE voltmarket_equipment_condition AS ENUM ('new', 'used', 'refurbished');
CREATE TYPE voltmarket_loi_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE voltmarket_nda_status AS ENUM ('pending', 'approved', 'rejected');

-- VoltMarket user profiles
CREATE TABLE voltmarket_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role voltmarket_user_role NOT NULL,
  seller_type voltmarket_seller_type,
  company_name TEXT,
  phone_number TEXT,
  is_id_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT,
  bio TEXT,
  website TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- VoltMarket listings
CREATE TABLE voltmarket_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  listing_type voltmarket_listing_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_location_confidential BOOLEAN DEFAULT FALSE,
  
  -- Site-specific fields
  power_capacity_mw DECIMAL(10, 2),
  square_footage INTEGER,
  property_type voltmarket_property_type,
  facility_tier TEXT,
  asking_price DECIMAL(15, 2),
  lease_rate DECIMAL(10, 2),
  available_power_mw DECIMAL(10, 2),
  
  -- Hosting-specific fields
  power_rate_per_kw DECIMAL(8, 2),
  cooling_type TEXT,
  hosting_types TEXT[],
  minimum_commitment_months INTEGER,
  
  -- Equipment-specific fields
  equipment_type voltmarket_equipment_type,
  brand TEXT,
  model TEXT,
  specs JSONB,
  equipment_condition voltmarket_equipment_condition,
  manufacture_year INTEGER,
  quantity INTEGER DEFAULT 1,
  shipping_terms TEXT,
  
  status voltmarket_listing_status DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VoltMarket listing images
CREATE TABLE voltmarket_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VoltMarket documents (for due diligence)
CREATE TABLE voltmarket_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  document_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VoltMarket NDA requests
CREATE TABLE voltmarket_nda_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  status voltmarket_nda_status DEFAULT 'pending',
  nda_document_url TEXT,
  signed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, requester_id)
);

-- VoltMarket messages
CREATE TABLE voltmarket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VoltMarket LOIs (Letters of Intent)
CREATE TABLE voltmarket_lois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  offered_price DECIMAL(15, 2),
  deposit_amount DECIMAL(15, 2),
  conditions TEXT,
  timeline_days INTEGER,
  custom_loi_url TEXT,
  status voltmarket_loi_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- VoltMarket watchlist
CREATE TABLE voltmarket_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- VoltMarket notifications
CREATE TABLE voltmarket_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES voltmarket_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE voltmarket_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltmarket_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltmarket_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltmarket_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltmarket_nda_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltmarket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltmarket_lois ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltmarket_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltmarket_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voltmarket_profiles
CREATE POLICY "Users can view all profiles" ON voltmarket_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON voltmarket_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON voltmarket_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for voltmarket_listings
CREATE POLICY "Anyone can view active listings" ON voltmarket_listings FOR SELECT USING (status = 'active' OR auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id));
CREATE POLICY "Sellers can manage own listings" ON voltmarket_listings FOR ALL TO authenticated USING (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id));
CREATE POLICY "Sellers can create listings" ON voltmarket_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id));

-- RLS Policies for voltmarket_listing_images
CREATE POLICY "Images follow listing visibility" ON voltmarket_listing_images FOR SELECT USING (
  listing_id IN (SELECT id FROM voltmarket_listings WHERE status = 'active' OR auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id))
);
CREATE POLICY "Sellers can manage listing images" ON voltmarket_listing_images FOR ALL TO authenticated USING (
  listing_id IN (SELECT id FROM voltmarket_listings WHERE auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id))
);

-- RLS Policies for voltmarket_documents
CREATE POLICY "Sellers can manage documents" ON voltmarket_documents FOR ALL TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = uploader_id)
);
CREATE POLICY "Approved users can view private documents" ON voltmarket_documents FOR SELECT TO authenticated USING (
  NOT is_private OR 
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = uploader_id) OR
  (listing_id, auth.uid()) IN (
    SELECT nr.listing_id, vp.user_id 
    FROM voltmarket_nda_requests nr 
    JOIN voltmarket_profiles vp ON vp.id = nr.requester_id 
    WHERE nr.status = 'approved'
  )
);

-- RLS Policies for voltmarket_nda_requests
CREATE POLICY "Users can view own NDA requests" ON voltmarket_nda_requests FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = requester_id) OR
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id)
);
CREATE POLICY "Users can create NDA requests" ON voltmarket_nda_requests FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = requester_id)
);
CREATE POLICY "Sellers can update NDA requests" ON voltmarket_nda_requests FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id)
);

-- RLS Policies for voltmarket_messages
CREATE POLICY "Users can view own messages" ON voltmarket_messages FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = sender_id) OR
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = recipient_id)
);
CREATE POLICY "Users can send messages" ON voltmarket_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = sender_id)
);
CREATE POLICY "Recipients can update messages" ON voltmarket_messages FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = recipient_id)
);

-- RLS Policies for voltmarket_lois
CREATE POLICY "Users can view relevant LOIs" ON voltmarket_lois FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = buyer_id) OR
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id)
);
CREATE POLICY "Buyers can create LOIs" ON voltmarket_lois FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = buyer_id)
);
CREATE POLICY "Sellers can update LOIs" ON voltmarket_lois FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = seller_id)
);

-- RLS Policies for voltmarket_watchlist
CREATE POLICY "Users can manage own watchlist" ON voltmarket_watchlist FOR ALL TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = user_id)
);

-- RLS Policies for voltmarket_notifications
CREATE POLICY "Users can view own notifications" ON voltmarket_notifications FOR SELECT TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = user_id)
);
CREATE POLICY "Users can update own notifications" ON voltmarket_notifications FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = user_id)
);

-- Create indexes for performance
CREATE INDEX idx_voltmarket_listings_type ON voltmarket_listings(listing_type);
CREATE INDEX idx_voltmarket_listings_status ON voltmarket_listings(status);
CREATE INDEX idx_voltmarket_listings_seller ON voltmarket_listings(seller_id);
CREATE INDEX idx_voltmarket_listings_location ON voltmarket_listings(latitude, longitude);
CREATE INDEX idx_voltmarket_messages_listing ON voltmarket_messages(listing_id);
CREATE INDEX idx_voltmarket_messages_participants ON voltmarket_messages(sender_id, recipient_id);
CREATE INDEX idx_voltmarket_nda_requests_listing ON voltmarket_nda_requests(listing_id, requester_id);
