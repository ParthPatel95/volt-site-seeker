-- Add workspace_type to inventory_workspaces for demolition mode
ALTER TABLE inventory_workspaces 
ADD COLUMN IF NOT EXISTS workspace_type TEXT DEFAULT 'general' 
CHECK (workspace_type IN ('general', 'demolition', 'construction', 'warehouse'));

-- Add demolition-specific columns to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS metal_type TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS metal_grade TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS estimated_weight DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'lbs';
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS scrap_price_per_unit DECIMAL(10,4);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS is_salvageable BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS salvage_value DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS has_hazmat_flags BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS hazmat_details JSONB;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS removal_complexity TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS labor_hours_estimate DECIMAL(5,2);

-- Add constraint for metal_type
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_metal_type_check 
CHECK (metal_type IS NULL OR metal_type IN ('copper', 'aluminum', 'steel', 'brass', 'stainless', 'iron', 'mixed', 'unknown'));

-- Add constraint for removal_complexity
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_removal_complexity_check 
CHECK (removal_complexity IS NULL OR removal_complexity IN ('simple', 'moderate', 'complex'));

-- Create index for metal_type queries
CREATE INDEX IF NOT EXISTS idx_inventory_items_metal_type ON inventory_items(metal_type) WHERE metal_type IS NOT NULL;

-- Create index for workspace_type queries  
CREATE INDEX IF NOT EXISTS idx_inventory_workspaces_type ON inventory_workspaces(workspace_type);