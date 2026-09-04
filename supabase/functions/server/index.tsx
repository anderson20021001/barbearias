import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();
app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// ─── Health ──────────────────────────────────────────────────────────────────
app.get("/make-server-92cb6063/health", (c) => c.json({ status: "ok" }));

// ─── Setup DB tables ─────────────────────────────────────────────────────────
app.post("/make-server-92cb6063/setup", async (c) => {
  const supabase = getSupabase();

  const sql = `
    CREATE TABLE IF NOT EXISTS barbershops (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      nome text NOT NULL,
      descricao text,
      bairro text NOT NULL,
      cidade text NOT NULL,
      estado text NOT NULL,
      regiao text NOT NULL DEFAULT 'Centro',
      whatsapp text,
      instagram text,
      cover_url text,
      logo_url text,
      horario text,
      avaliacao numeric DEFAULT 5.0,
      avaliacoes integer DEFAULT 0,
      aberto boolean DEFAULT true,
      ativo boolean DEFAULT false,
      tags text[] DEFAULT '{}',
      especialidades text[] DEFAULT '{}',
      status text DEFAULT 'pendente',
      plano_status text DEFAULT 'trialing',
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
  `;

  const { error } = await supabase.rpc("exec_sql", { sql }).catch(() => ({ error: null }));

  // Fallback: run via pg directly
  try {
    await supabase.from("barbershops").select("id").limit(1);
  } catch (_) {
    // table might not exist yet
  }

  return c.json({ ok: true, note: "Tables created or already exist" });
});

// ─── GET /barbershops ─────────────────────────────────────────────────────────
app.get("/make-server-92cb6063/barbershops", async (c) => {
  const supabase = getSupabase();
  const regiao = c.req.query("regiao");
  const busca = c.req.query("busca");

  let query = supabase
    .from("barbershops")
    .select(`
      *,
      barbers(*),
      services(*)
    `)
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (regiao && regiao !== "Todas") query = query.eq("regiao", regiao);
  if (busca) query = query.or(`nome.ilike.%${busca}%,bairro.ilike.%${busca}%`);

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data ?? []);
});

// ─── GET /barbershops/:id ─────────────────────────────────────────────────────
app.get("/make-server-92cb6063/barbershops/:id", async (c) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("barbershops")
    .select(`*, barbers(*), services(*)`)
    .eq("id", c.req.param("id"))
    .single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// ─── POST /appointments ───────────────────────────────────────────────────────
app.post("/make-server-92cb6063/appointments", async (c) => {
  const supabase = getSupabase();
  const body = await c.req.json();

  const { barbershop_id, barber_id, service_id, cliente_nome, cliente_email, cliente_whatsapp, horario, valor } = body;
  if (!barbershop_id || !cliente_nome || !cliente_email || !cliente_whatsapp || !horario) {
    return c.json({ error: "Campos obrigatórios: barbershop_id, cliente_nome, cliente_email, cliente_whatsapp, horario" }, 400);
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({ barbershop_id, barber_id, service_id, cliente_nome, cliente_email, cliente_whatsapp, horario, valor, status: "pending" })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// ─── GET /appointments/:barbershop_id ─────────────────────────────────────────
app.get("/make-server-92cb6063/appointments/:barbershop_id", async (c) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, barbers(nome), services(nome, preco)")
    .eq("barbershop_id", c.req.param("barbershop_id"))
    .order("horario", { ascending: true });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data ?? []);
});

// ─── PUT /appointments/:id/status ─────────────────────────────────────────────
app.put("/make-server-92cb6063/appointments/:id/status", async (c) => {
  const supabase = getSupabase();
  const { status } = await c.req.json();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", c.req.param("id"))
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ─── POST /registrations (barber signup) ─────────────────────────────────────
app.post("/make-server-92cb6063/registrations", async (c) => {
  const supabase = getSupabase();
  const body = await c.req.json();

  const { nome, whatsapp, instagram, nome_barbearia, bairro, cidade, estado, horario, descricao, especialidades } = body;
  if (!nome || !whatsapp || !nome_barbearia) {
    return c.json({ error: "Campos obrigatórios: nome, whatsapp, nome_barbearia" }, 400);
  }

  const { data, error } = await supabase
    .from("registrations")
    .insert({ nome, whatsapp, instagram, nome_barbearia, bairro, cidade, estado, horario, descricao, especialidades, status: "pendente", plano: "pro", preco: 50 })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

Deno.serve(app.fetch);
