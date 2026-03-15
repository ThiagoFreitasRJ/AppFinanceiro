-- Add renda fixa specific columns to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS yield_rate DECIMAL(8,4);
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS yield_type TEXT;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS maturity_date DATE;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS admin_fee DECIMAL(6,4) DEFAULT 0;
