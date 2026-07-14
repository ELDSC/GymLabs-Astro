-- Crear tabla para registrar las compras simuladas
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  age int NOT NULL,
  sex text NOT NULL,
  cart_items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  discount_code text,
  discount_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Permitir que usuarios anónimos inserten sus compras
CREATE POLICY "Public insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (true);

-- Permitir que solo los administradores vean las compras registradas
CREATE POLICY "Admin read purchases" ON public.purchases
  FOR SELECT USING (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid()
    )
  );
