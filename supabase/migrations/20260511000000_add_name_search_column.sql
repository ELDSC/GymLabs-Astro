-- Enable unaccent extension for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add normalized search column for accent-insensitive product search
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_search text;

-- Index for fast search
CREATE INDEX IF NOT EXISTS idx_products_name_search
ON products USING btree (name_search);

-- Trigger function: auto-populate name_search from name (without accents)
CREATE OR REPLACE FUNCTION update_name_search()
RETURNS trigger AS $$
BEGIN
  NEW.name_search := unaccent(NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: fires on INSERT or UPDATE of name
DROP TRIGGER IF EXISTS trg_products_name_search ON products;
CREATE TRIGGER trg_products_name_search
  BEFORE INSERT OR UPDATE OF name ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_name_search();

-- Populate name_search for existing products
UPDATE products SET name_search = unaccent(name);
