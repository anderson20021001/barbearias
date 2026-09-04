-- Run this SQL in your Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/puduyguwwvqiitgjezjp/sql

CREATE TABLE IF NOT EXISTS barbershops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  bairro text NOT NULL,
  cidade text NOT NULL,
  estado text NOT NULL DEFAULT 'SP',
  regiao text NOT NULL DEFAULT 'Centro',
  whatsapp text,
  instagram text,
  cover_url text,
  logo_url text,
  horario text,
  avaliacao numeric DEFAULT 5.0,
  avaliacoes integer DEFAULT 0,
  aberto boolean DEFAULT true,
  ativo boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  especialidades text[] DEFAULT '{}',
  status text DEFAULT 'ativa',
  plano_status text DEFAULT 'active',
  owner_nome text,
  owner_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  nome text NOT NULL,
  especialidade text,
  foto_url text,
  avaliacao numeric DEFAULT 5.0,
  cortes integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  preco numeric NOT NULL,
  duracao_minutos integer DEFAULT 30,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id),
  service_id uuid REFERENCES services(id),
  cliente_nome text NOT NULL,
  cliente_email text NOT NULL,
  cliente_whatsapp text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  horario time NOT NULL,
  valor numeric,
  status text DEFAULT 'pending',
  observacoes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  whatsapp text NOT NULL,
  instagram text,
  nome_barbearia text NOT NULL,
  bairro text,
  cidade text,
  estado text,
  horario text,
  descricao text,
  especialidades text[] DEFAULT '{}',
  status text DEFAULT 'pendente',
  plano text DEFAULT 'pro',
  preco numeric DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Public read for active barbershops
CREATE POLICY "public_read_barbershops" ON barbershops FOR SELECT USING (ativo = true);
CREATE POLICY "public_read_barbers" ON barbers FOR SELECT USING (ativo = true);
CREATE POLICY "public_read_services" ON services FOR SELECT USING (ativo = true);

-- Anyone can create appointments (no login required)
CREATE POLICY "anyone_create_appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Anyone can register as barber
CREATE POLICY "anyone_create_registrations" ON registrations FOR INSERT WITH CHECK (true);

-- Sample data (optional)
-- INSERT INTO barbershops (nome, bairro, cidade, regiao, descricao, whatsapp, instagram, avaliacao, avaliacoes, tags)
-- VALUES ('Barbearia Silva', 'Vila Madalena', 'São Paulo', 'Zona Oeste', 'Referência em degradê e afro', '11999990001', '@barbearia.silva', 4.9, 312, ARRAY['Degradê','Afro','Barba']);
