-- Add asset_type to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS asset_type TEXT DEFAULT 'acao';
