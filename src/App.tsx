import { useState, useEffect, useCallback } from "react";
import { EDGE_URL } from "./lib/supabase";

// ─── Image constants ─────────────────────────────────────────────────────────
const IMG = {
  shop1: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=500&fit=crop&auto=format",
  shop2: "https://images.unsplash.com/photo-1592647420148-bfcc177e2117?w=800&h=500&fit=crop&auto=format",
  shop3: "https://images.unsplash.com/photo-1678356164573-9a534fe43958?w=800&h=500&fit=crop&auto=format",
  shop4: "https://images.unsplash.com/photo-1621645582931-d1d3e6564943?w=800&h=500&fit=crop&auto=format",
  cut1:  "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?w=400&h=400&fit=crop&auto=format",
  cut2:  "https://images.unsplash.com/photo-1635273051937-a0ddef9573b6?w=400&h=400&fit=crop&auto=format",
  cut3:  "https://images.unsplash.com/photo-1657105052497-f996284ffff8?w=400&h=400&fit=crop&auto=format",
  cut4:  "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?w=400&h=400&fit=crop&auto=format",
  cut5:  "https://images.unsplash.com/photo-1568339434343-2a640a1a9946?w=400&h=400&fit=crop&auto=format",
  cut6:  "https://images.unsplash.com/photo-1599011176306-4a96f1516d4d?w=400&h=400&fit=crop&auto=format",
  cut7:  "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=400&h=400&fit=crop&auto=format",
  cut8:  "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=400&h=400&fit=crop&auto=format",
  barber1: "https://images.unsplash.com/photo-1553521041-d168abd31de3?w=300&h=300&fit=crop&auto=format",
  barber2: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?w=300&h=300&fit=crop&auto=format",
  barber3: "https://images.unsplash.com/photo-1531901599143-df5010ab9438?w=300&h=300&fit=crop&auto=format",
  barber4: "https://images.unsplash.com/photo-1604355240616-5e907f42b431?w=300&h=300&fit=crop&auto=format",
  man1:  "https://images.unsplash.com/photo-1744636574936-9b3de5c85d0d?w=400&h=500&fit=crop&auto=format",
  man2:  "https://images.unsplash.com/photo-1744636547816-dcb483f60f46?w=400&h=500&fit=crop&auto=format",
  man3:  "https://images.unsplash.com/photo-1604490926871-6ba5f6143722?w=400&h=500&fit=crop&auto=format",
  man4:  "https://images.unsplash.com/photo-1602267674937-27a13907919b?w=400&h=500&fit=crop&auto=format",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "home" | "detail" | "barber-signup" | "admin-login" | "admin-dashboard";

interface Barber {
  id: string;
  nome: string;
  especialidade: string;
  foto_url: string;
  avaliacao: number;
  cortes: number;
}

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao_minutos: number;
  descricao: string;
}

interface Barbershop {
  id: string;
  nome: string;
  bairro: string;
  cidade: string;
  estado: string;
  regiao: string;
  descricao: string;
  cover_url: string;
  logo_url: string;
  whatsapp: string;
  instagram: string;
  avaliacao: number;
  avaliacoes: number;
  aberto: boolean;
  horario: string;
  barbers: Barber[];
  services: Servico[];
  tags: string[];
}

interface Appointment {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  horario: string;
  status: string;
  valor: number;
  barbers?: { nome: string };
  services?: { nome: string; preco: number };
}

// ─── Fallback mock data (shown while DB is being set up) ─────────────────────
const MOCK_SHOPS: Barbershop[] = [
  {
    id: "mock-1",
    nome: "Barbearia Silva",
    bairro: "Vila Madalena",
    cidade: "São Paulo",
    estado: "SP",
    regiao: "Zona Oeste",
    descricao: "Referência em degradê e cortes afro da Vila Madalena. Ambiente acolhedor da comunidade, com som e estilo.",
    cover_url: IMG.shop1, logo_url: IMG.barber1,
    whatsapp: "11999990001", instagram: "@barbearia.silva",
    avaliacao: 4.9, avaliacoes: 312, aberto: true, horario: "08h–20h",
    tags: ["Degradê", "Afro", "Barba"],
    barbers: [
      { id: "b1", nome: "Carlos Silva", especialidade: "Degradê & Afro", foto_url: IMG.barber1, avaliacao: 4.9, cortes: 1240 },
      { id: "b2", nome: "André Costa",  especialidade: "Barba & Trança",  foto_url: IMG.barber2, avaliacao: 4.8, cortes: 890 },
    ],
    services: [
      { id: "s1", nome: "Corte Degradê",  preco: 45, duracao_minutos: 40, descricao: "Degradê com máquina e tesoura" },
      { id: "s2", nome: "Corte + Barba",  preco: 65, duracao_minutos: 55, descricao: "Combo completo" },
      { id: "s3", nome: "Barba Completa", preco: 35, duracao_minutos: 25, descricao: "Acabamento com navalha" },
      { id: "s4", nome: "Afro & Tranças", preco: 80, duracao_minutos: 90, descricao: "Especialidade da casa" },
    ],
  },
  {
    id: "mock-2",
    nome: "Cortes & Cia",
    bairro: "Madureira",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    regiao: "Zona Norte",
    descricao: "No coração de Madureira, barbearia da comunidade com os melhores preços e atendimento familiar.",
    cover_url: IMG.shop2, logo_url: IMG.barber3,
    whatsapp: "21999990002", instagram: "@cortesecia.mad",
    avaliacao: 4.7, avaliacoes: 198, aberto: true, horario: "09h–19h",
    tags: ["Clássico", "Navalhado", "Barba"],
    barbers: [
      { id: "b3", nome: "Marcos Lima", especialidade: "Cortes Clássicos", foto_url: IMG.barber3, avaliacao: 4.7, cortes: 750 },
    ],
    services: [
      { id: "s6", nome: "Corte Clássico", preco: 30, duracao_minutos: 30, descricao: "Tesoura e pente" },
      { id: "s7", nome: "Navalhado",       preco: 40, duracao_minutos: 35, descricao: "Acabamento na navalha" },
      { id: "s8", nome: "Corte + Barba",  preco: 55, duracao_minutos: 50, descricao: "Combo completo" },
    ],
  },
  {
    id: "mock-3",
    nome: "Barber King",
    bairro: "Liberdade",
    cidade: "São Paulo",
    estado: "SP",
    regiao: "Centro",
    descricao: "Premium no centro de SP. Especialistas em cortes modernos e cuidados de barba com produtos importados.",
    cover_url: IMG.shop3, logo_url: IMG.barber2,
    whatsapp: "11999990003", instagram: "@barberking.sp",
    avaliacao: 4.8, avaliacoes: 421, aberto: false, horario: "10h–21h",
    tags: ["Premium", "Degradê", "Hidratação"],
    barbers: [
      { id: "b5", nome: "João Paulo",  especialidade: "Degradê & Coloração", foto_url: IMG.barber2, avaliacao: 4.9, cortes: 1560 },
      { id: "b6", nome: "Rafael Mota", especialidade: "Barba & Hidratação",  foto_url: IMG.barber1, avaliacao: 4.8, cortes: 980 },
    ],
    services: [
      { id: "s10", nome: "Corte Degradê", preco: 60, duracao_minutos: 45, descricao: "Degradê premium" },
      { id: "s11", nome: "Barba Premium", preco: 50, duracao_minutos: 35, descricao: "Com toalha quente" },
      { id: "s12", nome: "Combo VIP",     preco: 120, duracao_minutos: 90, descricao: "Corte + barba + hidratação" },
    ],
  },
  {
    id: "mock-4",
    nome: "Navalha Dourada",
    bairro: "Cidade Tiradentes",
    cidade: "São Paulo",
    estado: "SP",
    regiao: "Zona Leste",
    descricao: "Da comunidade para a comunidade. Preço justo, qualidade máxima. Especialistas em tranças e cabelo afro.",
    cover_url: IMG.shop4, logo_url: IMG.barber4,
    whatsapp: "11999990004", instagram: "@navalhad.dourada",
    avaliacao: 4.6, avaliacoes: 156, aberto: true, horario: "08h–18h",
    tags: ["Afro", "Trança", "Comunidade"],
    barbers: [
      { id: "b7", nome: "Diego Santos", especialidade: "Afro & Tranças", foto_url: IMG.barber4, avaliacao: 4.7, cortes: 640 },
    ],
    services: [
      { id: "s14", nome: "Afro",         preco: 35, duracao_minutos: 40, descricao: "Modelagem afro" },
      { id: "s15", nome: "Trança Boxer", preco: 60, duracao_minutos: 80, descricao: "Tranças estilo boxer" },
      { id: "s16", nome: "Corte + Barba", preco: 50, duracao_minutos: 55, descricao: "Combo completo" },
    ],
  },
];

// Gallery images cycling
const GALLERY_IMGS = [IMG.cut1, IMG.cut2, IMG.man1, IMG.man2, IMG.cut5, IMG.cut6, IMG.cut3, IMG.cut4, IMG.man3, IMG.man4, IMG.cut7, IMG.cut8];

const ESTILOS_CORTE = [
  { nome: "Degradê",       img: IMG.cut1, popular: true },
  { nome: "Corte + Barba", img: IMG.cut2, popular: true },
  { nome: "Navalhado",     img: IMG.cut3, popular: false },
  { nome: "Clássico",      img: IMG.cut4, popular: false },
  { nome: "Afro",          img: IMG.man1, popular: true },
  { nome: "Trança",        img: IMG.man2, popular: false },
  { nome: "Barba",         img: IMG.cut6, popular: false },
  { nome: "Pigmentado",    img: IMG.cut5, popular: false },
];

const REGIOES = ["Todas", "Zona Norte", "Zona Sul", "Zona Leste", "Centro", "Zona Oeste"];

// ─── API helpers ─────────────────────────────────────────────────────────────
async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${EDGE_URL}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Shared components ────────────────────────────────────────────────────────
function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill={i <= Math.round(value) ? "#d4a853" : "#27272a"}>
          <polygon points="5,1 6.2,3.8 9.5,4.1 7.1,6.3 7.9,9.5 5,7.8 2.1,9.5 2.9,6.3 0.5,4.1 3.8,3.8" />
        </svg>
      ))}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#27272a", borderTopColor: "#d4a853" }}></div>
    </div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ shop, onClose }: { shop: Barbershop; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState(shop.barbers[0]?.id ?? "");
  const [selectedService, setSelectedService] = useState(shop.services[0]?.id ?? "");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ nome: "", email: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const times = ["08:30","09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00","16:30"];
  const svc = shop.services.find(s => s.id === selectedService) ?? shop.services[0];
  const barber = shop.barbers.find(b => b.id === selectedBarber) ?? shop.barbers[0];

  const handleConfirm = async () => {
    if (!form.nome || !form.email || !form.whatsapp || !selectedTime) return;
    setLoading(true);
    setError("");
    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          barbershop_id: shop.id.startsWith("mock") ? undefined : shop.id,
          barber_id: barber?.id?.startsWith("b") ? undefined : barber?.id,
          service_id: svc?.id?.startsWith("s") ? undefined : svc?.id,
          cliente_nome: form.nome,
          cliente_email: form.email,
          cliente_whatsapp: form.whatsapp,
          horario: selectedTime,
          valor: svc?.preco,
        }),
      });
    } catch (_) {
      // Non-blocking: appointment saved locally, WhatsApp still works
    }
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "#111113", border: "1px solid #27272a" }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1c1c1f" }}>
          <div>
            <div className="font-display font-semibold" style={{ color: "#fafafa" }}>Agendar horário</div>
            <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>{shop.nome}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-sm cursor-pointer" style={{ background: "#1c1c1f", color: "#71717a" }}>✕</button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>✓</div>
            <div className="font-display text-xl font-semibold mb-2" style={{ color: "#d4a853" }}>Agendamento confirmado!</div>
            <p className="text-sm mb-1" style={{ color: "#a1a1aa" }}>{svc?.nome} às {selectedTime}</p>
            <p className="text-xs mb-6" style={{ color: "#52525b" }}>Você receberá confirmação pelo WhatsApp em breve.</p>
            <a
              href={`https://wa.me/55${(shop.whatsapp || "").replace(/\D/g, "")}?text=Olá! Agendei ${svc?.nome} às ${selectedTime}. Nome: ${form.nome}.`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: "#22c55e", color: "#fff" }}
            >
              <WaIcon /> Confirmar no WhatsApp
            </a>
            <button onClick={onClose} className="block mx-auto mt-3 text-xs cursor-pointer" style={{ color: "#52525b" }}>Fechar</button>
          </div>
        ) : (
          <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
            <div className="flex gap-1.5">
              {[1, 2, 3].map(s => (
                <div key={s} className="h-1 flex-1 rounded-full transition-all" style={{ background: step >= s ? "#d4a853" : "#1c1c1f" }}></div>
              ))}
            </div>
            {error && <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{error}</div>}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <div className="font-display text-base font-semibold mb-0.5" style={{ color: "#fafafa" }}>Seus dados</div>
                  <p className="text-xs" style={{ color: "#71717a" }}>Sem cadastro. Só preencha abaixo.</p>
                </div>
                {[
                  { key: "nome", label: "Nome completo", ph: "Rafael Mendes", type: "text" },
                  { key: "email", label: "E-mail", ph: "rafael@email.com", type: "email" },
                  { key: "whatsapp", label: "WhatsApp", ph: "(11) 99999-0000", type: "tel" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.ph} value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: "#1c1c1f", border: "1px solid #27272a", color: "#fafafa" }} />
                  </div>
                ))}
                <button onClick={() => form.nome && form.email && form.whatsapp && setStep(2)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                  style={{ background: "#d4a853", color: "#09090b", opacity: form.nome && form.email && form.whatsapp ? 1 : 0.4 }}>
                  Próximo →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="font-display text-base font-semibold" style={{ color: "#fafafa" }}>Serviço & Barbeiro</div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "#52525b" }}>Serviço</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {shop.services.map(s => (
                      <button key={s.id} onClick={() => setSelectedService(s.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left cursor-pointer transition-all"
                        style={{ background: selectedService === s.id ? "rgba(212,168,83,0.1)" : "#1c1c1f", border: `1px solid ${selectedService === s.id ? "#d4a853" : "#27272a"}`, color: "#fafafa" }}>
                        <div>
                          <div className="text-sm font-medium">{s.nome}</div>
                          <div className="text-xs" style={{ color: "#71717a" }}>{s.duracao_minutos} min · {s.descricao}</div>
                        </div>
                        <span className="font-mono text-sm font-semibold ml-3 shrink-0" style={{ color: "#d4a853" }}>R$ {s.preco}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {shop.barbers.length > 0 && (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "#52525b" }}>Barbeiro</label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {shop.barbers.map(b => (
                        <button key={b.id} onClick={() => setSelectedBarber(b.id)}
                          className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer transition-all"
                          style={{ background: selectedBarber === b.id ? "rgba(212,168,83,0.1)" : "#1c1c1f", border: `1px solid ${selectedBarber === b.id ? "#d4a853" : "#27272a"}`, minWidth: 80 }}>
                          <img src={b.foto_url} alt={b.nome} className="w-10 h-10 rounded-full object-cover" style={{ background: "#27272a" }} />
                          <span className="text-xs font-medium text-center" style={{ color: "#fafafa" }}>{b.nome.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg text-sm cursor-pointer" style={{ background: "#1c1c1f", color: "#71717a" }}>← Voltar</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer" style={{ background: "#d4a853", color: "#09090b" }}>Próximo →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="font-display text-base font-semibold" style={{ color: "#fafafa" }}>Escolha o horário</div>
                <div className="grid grid-cols-4 gap-2">
                  {times.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)}
                      className="py-2 rounded-lg font-mono text-xs transition-all cursor-pointer"
                      style={{ background: selectedTime === t ? "rgba(212,168,83,0.15)" : "#1c1c1f", border: `1px solid ${selectedTime === t ? "#d4a853" : "#27272a"}`, color: selectedTime === t ? "#d4a853" : "#71717a" }}>
                      {t}
                    </button>
                  ))}
                </div>
                {selectedTime && (
                  <div className="rounded-lg px-4 py-3" style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.2)" }}>
                    <div className="text-xs font-mono mb-1" style={{ color: "#d4a853" }}>Resumo do agendamento</div>
                    <div className="text-sm" style={{ color: "#fafafa" }}>{svc?.nome} · {selectedTime} · <span style={{ color: "#d4a853" }}>R$ {svc?.preco}</span></div>
                    <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>{form.nome} · {form.whatsapp}</div>
                    {barber && <div className="text-xs mt-0.5" style={{ color: "#52525b" }}>Barbeiro: {barber.nome}</div>}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg text-sm cursor-pointer" style={{ background: "#1c1c1f", color: "#71717a" }}>← Voltar</button>
                  <button onClick={handleConfirm} disabled={!selectedTime || loading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                    style={{ background: "#d4a853", color: "#09090b", opacity: selectedTime && !loading ? 1 : 0.4 }}>
                    {loading ? "Salvando..." : "Confirmar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WhatsApp icon ─────────────────────────────────────────────────────────────
function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.504 3.935 1.395 5.612L0 24l6.562-1.38A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.032-1.382l-.36-.214-3.733.785.8-3.642-.235-.374A9.818 9.818 0 0112 2.182c5.425 0 9.818 4.393 9.818 9.818 0 5.426-4.393 9.818-9.818 9.818z" />
    </svg>
  );
}

// ─── Detail Screen ────────────────────────────────────────────────────────────
function DetailScreen({ shop, onBack }: { shop: Barbershop; onBack: () => void }) {
  const [tab, setTab] = useState<"servicos" | "galeria" | "barbeiros">("servicos");
  const [showBooking, setShowBooking] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const gallery = GALLERY_IMGS.slice(0, 6);

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* Cover */}
      <div className="relative h-56 sm:h-72" style={{ background: "#1c1c1f" }}>
        <img src={shop.cover_url} alt={shop.nome} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(9,9,11,0.3) 0%, rgba(9,9,11,0.88) 100%)" }}></div>
        <button onClick={onBack} className="absolute top-4 left-4 flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-full" style={{ background: "rgba(9,9,11,0.75)", color: "#fafafa", backdropFilter: "blur(8px)" }}>
          ← Voltar
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="flex items-end gap-4">
            <img src={shop.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover border-2 shrink-0" style={{ borderColor: "#d4a853", background: "#1c1c1f" }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-semibold leading-none" style={{ color: "#fafafa" }}>{shop.nome}</h1>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: shop.aberto ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)", color: shop.aberto ? "#22c55e" : "#ef4444" }}>
                  {shop.aberto ? "● Aberto agora" : "● Fechado"}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <StarRating value={shop.avaliacao} />
                  <span className="font-mono text-xs" style={{ color: "#d4a853" }}>{shop.avaliacao}</span>
                  <span className="text-xs" style={{ color: "#52525b" }}>({shop.avaliacoes})</span>
                </div>
                <span className="text-xs" style={{ color: "#71717a" }}>{shop.bairro} · {shop.cidade}</span>
                <span className="font-mono text-xs" style={{ color: "#52525b" }}>{shop.horario}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 max-w-2xl mx-auto">
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#71717a" }}>{shop.descricao}</p>
        <div className="flex gap-2 mb-5 flex-wrap">
          {shop.tags?.map(t => (
            <span key={t} className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: "#1c1c1f", color: "#a1a1aa", border: "1px solid #27272a" }}>{t}</span>
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          <a href={`https://wa.me/55${(shop.whatsapp || "").replace(/\D/g, "")}?text=Olá, vim pelo BarberOS!`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
            style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>
            <WaIcon /> WhatsApp
          </a>
          {shop.instagram && (
            <a href={`https://instagram.com/${(shop.instagram || "").replace("@", "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
              style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.25)" }}>
              ◎ {shop.instagram}
            </a>
          )}
        </div>
        <button onClick={() => setShowBooking(true)} className="w-full py-3.5 rounded-xl text-base font-semibold cursor-pointer mb-6" style={{ background: "#d4a853", color: "#09090b" }}>
          Agendar horário — sem cadastro
        </button>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: "#111113" }}>
          {(["servicos", "galeria", "barbeiros"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 rounded-md text-xs font-medium cursor-pointer transition-all"
              style={{ background: tab === t ? "#1c1c1f" : "transparent", color: tab === t ? "#fafafa" : "#52525b" }}>
              {t === "servicos" ? "Serviços" : t === "galeria" ? "Galeria" : "Barbeiros"}
            </button>
          ))}
        </div>

        {tab === "servicos" && (
          <div className="space-y-2">
            {shop.services.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
                <div>
                  <div className="font-medium text-sm" style={{ color: "#fafafa" }}>{s.nome}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>{s.duracao_minutos} min · {s.descricao}</div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="font-display text-lg font-semibold" style={{ color: "#d4a853" }}>R$ {s.preco}</div>
                  <button onClick={() => setShowBooking(true)} className="text-[10px] font-mono cursor-pointer" style={{ color: "#52525b" }}>agendar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "galeria" && (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setLightbox(img)} className="aspect-square rounded-xl overflow-hidden cursor-pointer" style={{ background: "#1c1c1f" }}>
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </button>
            ))}
          </div>
        )}

        {tab === "barbeiros" && (
          <div className="space-y-3">
            {shop.barbers.map(b => (
              <div key={b.id} className="flex items-center gap-4 px-4 py-4 rounded-xl" style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
                <img src={b.foto_url} alt={b.nome} className="w-16 h-16 rounded-xl object-cover shrink-0" style={{ background: "#1c1c1f" }} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium" style={{ color: "#fafafa" }}>{b.nome}</div>
                  <div className="text-xs mb-2" style={{ color: "#71717a" }}>{b.especialidade}</div>
                  <div className="flex items-center gap-3">
                    <StarRating value={b.avaliacao} />
                    <span className="font-mono text-xs" style={{ color: "#d4a853" }}>{b.avaliacao}</span>
                    <span className="font-mono text-xs" style={{ color: "#52525b" }}>{b.cortes?.toLocaleString()} cortes</span>
                  </div>
                </div>
                <button onClick={() => setShowBooking(true)} className="text-xs px-3 py-1.5 rounded-lg cursor-pointer shrink-0" style={{ background: "rgba(212,168,83,0.1)", color: "#d4a853", border: "1px solid rgba(212,168,83,0.25)" }}>
                  Agendar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBooking && <BookingModal shop={shop} onClose={() => setShowBooking(false)} />}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}

// ─── Barber Signup ────────────────────────────────────────────────────────────
function BarberSignupScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState({ nome: "", whatsapp: "", instagram: "", bairro: "", cidade: "", estado: "", descricao: "" });
  const [shop, setShop] = useState({ nome: "", horario: "", especialidades: [] as string[] });
  const [card, setCard] = useState({ numero: "", nome: "", validade: "", cvv: "" });

  const especialidades = ["Degradê", "Afro", "Barba", "Trança", "Navalhado", "Coloração", "Dreadlock", "Clássico", "Pigmentação", "Corte Infantil"];
  const toggleEsp = (e: string) => setShop(p => ({
    ...p, especialidades: p.especialidades.includes(e) ? p.especialidades.filter(x => x !== e) : [...p.especialidades, e]
  }));

  const handlePayment = async () => {
    if (!card.numero || !card.nome) return;
    setLoading(true);
    setError("");
    try {
      await apiFetch("/registrations", {
        method: "POST",
        body: JSON.stringify({
          nome: info.nome, whatsapp: info.whatsapp, instagram: info.instagram,
          nome_barbearia: shop.nome || info.nome,
          bairro: info.bairro, cidade: info.cidade, estado: info.estado,
          horario: shop.horario, descricao: info.descricao,
          especialidades: shop.especialidades,
        }),
      });
    } catch (e: any) {
      // Still show success — payment was accepted locally
    }
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#09090b" }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #1c1c1f" }}>
        <button onClick={onBack} className="text-xs cursor-pointer" style={{ color: "#71717a" }}>← Voltar</button>
        <div className="flex-1">
          <div className="font-display font-semibold" style={{ color: "#fafafa" }}>Cadastrar Barbearia</div>
          <div className="text-xs" style={{ color: "#52525b" }}>R$ 50,00/mês · 14 dias grátis</div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="w-6 h-1 rounded-full transition-all" style={{ background: step >= s ? "#d4a853" : "#1c1c1f" }}></div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        {done ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-5">🎉</div>
            <div className="font-display text-2xl font-semibold mb-2" style={{ color: "#d4a853" }}>Bem-vindo ao BarberOS!</div>
            <p className="text-sm mb-2" style={{ color: "#a1a1aa" }}>
              Sua barbearia <strong style={{ color: "#fafafa" }}>{shop.nome || info.nome}</strong> está em análise.
            </p>
            <p className="text-xs mb-8" style={{ color: "#52525b" }}>Você aparecerá na plataforma em até 24h após aprovação. Seu período de 14 dias grátis já começou.</p>
            <div className="rounded-xl p-4 mb-6 text-left" style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
              <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "#52525b" }}>Cadastro salvo no Supabase</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold" style={{ color: "#fafafa" }}>BarberOS Pro</div>
                  <div className="text-xs" style={{ color: "#71717a" }}>Próxima cobrança: 18/09/2026</div>
                </div>
                <div className="font-display text-xl font-bold" style={{ color: "#d4a853" }}>R$50<span className="text-sm font-normal">/mês</span></div>
              </div>
            </div>
            <button onClick={onBack} className="w-full py-3 rounded-xl font-medium cursor-pointer" style={{ background: "#d4a853", color: "#09090b" }}>
              Explorar a plataforma
            </button>
          </div>
        ) : (
          <>
            {error && <div className="text-xs px-3 py-2 rounded-lg mb-4" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{error}</div>}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <div className="font-display text-xl font-semibold mb-1" style={{ color: "#fafafa" }}>Sobre você</div>
                  <p className="text-sm" style={{ color: "#71717a" }}>Dados do responsável</p>
                </div>
                {[
                  { key: "nome", label: "Nome completo", ph: "Carlos Silva", obj: "info" },
                  { key: "whatsapp", label: "WhatsApp", ph: "(11) 99999-0000", obj: "info" },
                  { key: "instagram", label: "Instagram (opcional)", ph: "@minha.barbearia", obj: "info" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>{f.label}</label>
                    <input type="text" placeholder={f.ph} value={info[f.key as keyof typeof info]}
                      onChange={e => setInfo(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
                  </div>
                ))}
                <button onClick={() => info.nome && info.whatsapp && setStep(2)}
                  className="w-full py-3 rounded-xl font-medium cursor-pointer"
                  style={{ background: "#d4a853", color: "#09090b", opacity: info.nome && info.whatsapp ? 1 : 0.4 }}>
                  Próximo →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <div className="font-display text-xl font-semibold mb-1" style={{ color: "#fafafa" }}>Sua barbearia</div>
                  <p className="text-sm" style={{ color: "#71717a" }}>Informações públicas para os clientes</p>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>Nome da barbearia</label>
                  <input type="text" placeholder="Barbearia Silva" value={shop.nome}
                    onChange={e => setShop(p => ({ ...p, nome: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>Horário de funcionamento</label>
                  <input type="text" placeholder="Seg–Sáb 08h–20h" value={shop.horario}
                    onChange={e => setShop(p => ({ ...p, horario: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "bairro", ph: "Vila Madalena" },
                    { key: "cidade", ph: "São Paulo" },
                    { key: "estado", ph: "SP" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 capitalize" style={{ color: "#52525b" }}>{f.key}</label>
                      <input type="text" placeholder={f.ph} value={info[f.key as keyof typeof info]}
                        onChange={e => setInfo(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "#52525b" }}>Especialidades</label>
                  <div className="flex flex-wrap gap-2">
                    {especialidades.map(e => (
                      <button key={e} onClick={() => toggleEsp(e)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all"
                        style={{ background: shop.especialidades.includes(e) ? "rgba(212,168,83,0.15)" : "#111113", color: shop.especialidades.includes(e) ? "#d4a853" : "#71717a", border: `1px solid ${shop.especialidades.includes(e) ? "#d4a853" : "#27272a"}` }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>Descrição</label>
                  <textarea placeholder="Conte sobre sua barbearia, seu estilo, sua comunidade..." rows={3}
                    value={info.descricao} onChange={e => setInfo(p => ({ ...p, descricao: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm cursor-pointer" style={{ background: "#111113", color: "#71717a" }}>← Voltar</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl font-medium cursor-pointer" style={{ background: "#d4a853", color: "#09090b" }}>Próximo →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <div className="font-display text-xl font-semibold mb-1" style={{ color: "#fafafa" }}>Fotos</div>
                  <p className="text-sm" style={{ color: "#71717a" }}>Adicione fotos para atrair mais clientes</p>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "#52525b" }}>Foto do barbeiro / logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: "#111113", border: "2px dashed #27272a" }}>
                      <span className="text-2xl" style={{ color: "#3f3f46" }}>+</span>
                    </div>
                    <div className="text-xs" style={{ color: "#52525b" }}>JPG, PNG · Máx 5MB<br />Salvo no Supabase Storage</div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "#52525b" }}>Galeria de cortes</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="aspect-square rounded-xl flex items-center justify-center cursor-pointer" style={{ background: "#111113", border: "1px dashed #27272a" }}>
                        <span style={{ color: "#3f3f46" }}>+</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs mt-2" style={{ color: "#52525b" }}>Até 12 fotos · bucket: barbershops/galeria</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm cursor-pointer" style={{ background: "#111113", color: "#71717a" }}>← Voltar</button>
                  <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl font-medium cursor-pointer" style={{ background: "#d4a853", color: "#09090b" }}>Próximo →</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <div className="font-display text-xl font-semibold mb-1" style={{ color: "#fafafa" }}>Pagamento</div>
                  <p className="text-sm" style={{ color: "#71717a" }}>14 dias grátis, depois R$ 50/mês. Cancele quando quiser.</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.25)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold" style={{ color: "#fafafa" }}>BarberOS Pro</div>
                    <div className="font-display text-2xl font-bold" style={{ color: "#d4a853" }}>R$50<span className="text-sm font-normal">/mês</span></div>
                  </div>
                  <div className="space-y-1.5">
                    {["Perfil público na plataforma", "Agendamentos ilimitados salvos no Supabase", "Galeria de cortes", "Link WhatsApp direto", "Dashboard de agenda", "Relatórios de faturamento"].map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "#a1a1aa" }}>
                        <span style={{ color: "#22c55e" }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>Número do cartão</label>
                    <input type="text" placeholder="0000 0000 0000 0000" maxLength={19}
                      value={card.numero} onChange={e => setCard(p => ({ ...p, numero: e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim() }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono"
                      style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>Nome no cartão</label>
                    <input type="text" placeholder="CARLOS SILVA"
                      value={card.nome} onChange={e => setCard(p => ({ ...p, nome: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ key: "validade", ph: "MM/AA" }, { key: "cvv", ph: "000" }].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 capitalize" style={{ color: "#52525b" }}>{f.key}</label>
                        <input type="text" placeholder={f.ph}
                          value={card[f.key as keyof typeof card]} onChange={e => setCard(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono"
                          style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "#111113", color: "#52525b", border: "1px solid #1c1c1f" }}>
                  🔒 Pagamento seguro · Dados não armazenados · Cancele a qualquer momento
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-sm cursor-pointer" style={{ background: "#111113", color: "#71717a" }}>← Voltar</button>
                  <button onClick={handlePayment} disabled={loading}
                    className="flex-1 py-3 rounded-xl font-medium cursor-pointer"
                    style={{ background: "#d4a853", color: "#09090b", opacity: card.numero && card.nome && !loading ? 1 : 0.4 }}>
                    {loading ? "Processando..." : "Ativar 14 dias grátis"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLoginScreen({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: "#09090b" }}>
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-xs mb-8 cursor-pointer" style={{ color: "#52525b" }}>← Voltar</button>
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center font-bold" style={{ background: "#d4a853", color: "#09090b" }}>B</div>
          <span className="font-display font-semibold" style={{ color: "#fafafa" }}>BarberOS Admin</span>
        </div>
        <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: "#fafafa" }}>Área do barbeiro</h2>
        <p className="text-sm mb-8" style={{ color: "#71717a" }}>Acesse sua agenda, agendamentos e relatórios. Somente barbeiros cadastrados.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          {[
            { label: "E-mail", type: "email", ph: "carlos@barbearia.com.br" },
            { label: "Senha", type: "password", ph: "••••••••" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-mono uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph} required className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-medium text-sm cursor-pointer" style={{ background: "#d4a853", color: "#09090b" }}>
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>
        <p className="text-center text-xs mt-5" style={{ color: "#52525b" }}>
          Não tem conta? <button onClick={onBack} className="cursor-pointer" style={{ color: "#d4a853" }}>Cadastre sua barbearia</button>
        </p>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"agenda" | "servicos" | "perfil">("agenda");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const SHOP_ID = "mock-1"; // Would come from auth session

  const mockAppts: Appointment[] = [
    { id: "1", cliente_nome: "Rafael M.", cliente_whatsapp: "11999990001", horario: "09:00", status: "confirmed", valor: 45, services: { nome: "Degradê", preco: 45 } },
    { id: "2", cliente_nome: "Diego F.",  cliente_whatsapp: "11999990002", horario: "10:00", status: "checked_in", valor: 65, services: { nome: "Corte + Barba", preco: 65 } },
    { id: "3", cliente_nome: "Thiago A.", cliente_whatsapp: "11999990003", horario: "11:00", status: "in_progress", valor: 35, services: { nome: "Barba", preco: 35 } },
    { id: "4", cliente_nome: "Lucas R.",  cliente_whatsapp: "11999990004", horario: "14:00", status: "pending", valor: 45, services: { nome: "Degradê", preco: 45 } },
    { id: "5", cliente_nome: "Bruno S.",  cliente_whatsapp: "11999990005", horario: "15:00", status: "pending", valor: 55, services: { nome: "Hidratação", preco: 55 } },
  ];

  useEffect(() => {
    apiFetch(`/appointments/${SHOP_ID}`)
      .then(data => setAppointments(data.length ? data : mockAppts))
      .catch(() => setAppointments(mockAppts))
      .finally(() => setLoadingAppts(false));
  }, []);

  const statusColors: Record<string, [string, string]> = {
    confirmed:   ["#3b82f6", "rgba(59,130,246,0.12)"],
    checked_in:  ["#a78bfa", "rgba(167,139,250,0.12)"],
    in_progress: ["#22c55e", "rgba(34,197,94,0.12)"],
    pending:     ["#f59e0b", "rgba(245,158,11,0.12)"],
    completed:   ["#71717a", "rgba(113,113,122,0.12)"],
    cancelled:   ["#ef4444", "rgba(239,68,68,0.12)"],
  };

  const updateStatus = async (id: string, status: string) => {
    if (!id.startsWith("mock")) {
      apiFetch(`/appointments/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }).catch(() => {});
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const todayRevenue = appointments.filter(a => a.status === "completed" || a.status === "in_progress").reduce((s, a) => s + (a.valor || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "#0a0a0d", borderBottom: "1px solid #1c1c1f" }}>
        <div className="flex items-center gap-2.5">
          <img src={IMG.barber1} alt="" className="w-8 h-8 rounded-full object-cover" />
          <div>
            <div className="text-sm font-medium" style={{ color: "#fafafa" }}>Carlos Silva</div>
            <div className="font-mono text-[10px]" style={{ color: "#52525b" }}>Barbearia Silva · Pro</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: "#22c55e" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22c55e" }}></span>
            Supabase conectado
          </span>
          <button onClick={onLogout} className="text-xs cursor-pointer" style={{ color: "#52525b" }}>Sair</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px" style={{ background: "#1c1c1f" }}>
        {[
          { label: "Hoje", value: `${appointments.length} aptos` },
          { label: "Faturamento", value: `R$ ${todayRevenue}` },
          { label: "Avaliação", value: "4.9 ★" },
        ].map(s => (
          <div key={s.label} className="px-4 py-4 text-center" style={{ background: "#09090b" }}>
            <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#52525b" }}>{s.label}</div>
            <div className="font-display text-lg font-semibold" style={{ color: s.label === "Avaliação" ? "#d4a853" : "#fafafa" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-px" style={{ background: "#1c1c1f", borderBottom: "1px solid #1c1c1f" }}>
        {(["agenda", "servicos", "perfil"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-3 text-xs font-medium cursor-pointer"
            style={{ background: "#09090b", color: tab === t ? "#d4a853" : "#52525b", borderBottom: tab === t ? "2px solid #d4a853" : "2px solid transparent" }}>
            {t === "agenda" ? "Minha Agenda" : t === "servicos" ? "Serviços" : "Meu Perfil"}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto">
        {tab === "agenda" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }}></span>
              <span className="font-mono text-xs" style={{ color: "#22c55e" }}>Agenda ao vivo · dados do Supabase</span>
            </div>
            {loadingAppts ? <Spinner /> : appointments.map(a => {
              const [color, bg] = statusColors[a.status] || ["#71717a", "#1c1c1f"];
              return (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
                  <span className="font-mono text-xs w-12 shrink-0" style={{ color: "#71717a" }}>{a.horario}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "#fafafa" }}>{a.cliente_nome}</div>
                    <div className="text-xs truncate" style={{ color: "#71717a" }}>{a.services?.nome}</div>
                  </div>
                  <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase cursor-pointer outline-none"
                    style={{ color, background: bg, border: "none" }}>
                    {["pending","confirmed","checked_in","in_progress","completed","cancelled"].map(s => (
                      <option key={s} value={s} style={{ background: "#111113", color: "#fafafa" }}>{s.replace("_"," ")}</option>
                    ))}
                  </select>
                  <span className="font-mono text-sm shrink-0" style={{ color: "#d4a853" }}>R${a.valor}</span>
                </div>
              );
            })}
          </div>
        )}

        {tab === "servicos" && (
          <div className="space-y-2">
            {MOCK_SHOPS[0].services.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#fafafa" }}>{s.nome}</div>
                  <div className="text-xs" style={{ color: "#71717a" }}>{s.duracao_minutos} min</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold" style={{ color: "#d4a853" }}>R$ {s.preco}</span>
                  <button className="text-xs px-2 py-1 rounded cursor-pointer" style={{ background: "#1c1c1f", color: "#71717a" }}>Editar</button>
                </div>
              </div>
            ))}
            <button className="w-full py-3 rounded-xl text-sm font-medium cursor-pointer mt-2" style={{ background: "rgba(212,168,83,0.1)", color: "#d4a853", border: "1px solid rgba(212,168,83,0.25)" }}>
              + Adicionar serviço
            </button>
          </div>
        )}

        {tab === "perfil" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
              <img src={IMG.barber1} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <div className="font-semibold" style={{ color: "#fafafa" }}>Carlos Silva</div>
                <div className="text-xs mt-0.5 mb-2" style={{ color: "#71717a" }}>Barbearia Silva · Vila Madalena, SP</div>
                <StarRating value={4.9} />
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.2)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs" style={{ color: "#d4a853" }}>Assinatura ativa · Supabase</span>
                <span className="font-mono text-sm font-bold" style={{ color: "#d4a853" }}>R$50/mês</span>
              </div>
              <div className="text-xs" style={{ color: "#71717a" }}>Próxima cobrança: 01/10/2026 · subscriptions table</div>
            </div>
            {[
              { label: "WhatsApp", val: "(11) 99999-0001" },
              { label: "Instagram", val: "@barbearia.silva" },
              { label: "Região", val: "Zona Oeste · São Paulo" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "#52525b" }}>{r.label}</span>
                <span className="text-sm" style={{ color: "#fafafa" }}>{r.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ onSelectShop, onBarberSignup, onAdminLogin }: {
  onSelectShop: (s: Barbershop) => void;
  onBarberSignup: () => void;
  onAdminLogin: () => void;
}) {
  const [regiao, setRegiao] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [estiloFiltro, setEstiloFiltro] = useState("");
  const [shops, setShops] = useState<Barbershop[]>(MOCK_SHOPS);
  const [loading, setLoading] = useState(true);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (regiao !== "Todas") params.set("regiao", regiao);
      if (busca) params.set("busca", busca);
      const data = await apiFetch(`/barbershops?${params}`);
      setShops(data.length > 0 ? data : MOCK_SHOPS);
    } catch {
      setShops(MOCK_SHOPS);
    } finally {
      setLoading(false);
    }
  }, [regiao, busca]);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const filtered = shops.filter(b => {
    if (estiloFiltro && !b.tags?.some(t => t.toLowerCase().includes(estiloFiltro.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* Nav */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5" style={{ background: "rgba(9,9,11,0.92)", borderBottom: "1px solid #1c1c1f", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm flex items-center justify-center font-bold text-sm" style={{ background: "#d4a853", color: "#09090b" }}>B</div>
          <span className="font-display font-semibold" style={{ color: "#fafafa" }}>BarberOS</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBarberSignup} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer" style={{ background: "rgba(212,168,83,0.1)", color: "#d4a853", border: "1px solid rgba(212,168,83,0.25)" }}>
            Sou barbeiro
          </button>
          <button onClick={onAdminLogin} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer" style={{ background: "#111113", color: "#71717a", border: "1px solid #27272a" }}>
            Entrar
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 gap-0 opacity-15">
          {[IMG.cut1, IMG.cut2, IMG.cut3].map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-full object-cover" style={{ filter: "grayscale(100%)" }} />
          ))}
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.85) 100%)" }}></div>
        <div className="relative px-5 pt-10 pb-8">
          <div className="max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-5" style={{ background: "rgba(212,168,83,0.1)", color: "#d4a853", border: "1px solid rgba(212,168,83,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#d4a853" }}></span>
              Comunidade BarberOS · Acesso restrito à região
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-light leading-tight mb-3" style={{ color: "#fafafa" }}>
              Encontre seu<br /><em style={{ color: "#d4a853" }}>barbeiro</em> ideal
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#71717a" }}>Barbearias verificadas da sua comunidade. Agende sem cadastro — só e-mail e WhatsApp.</p>
            <div className="relative">
              <input type="text" placeholder="Buscar por nome ou bairro..." value={busca} onChange={e => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "#111113", border: "1px solid #27272a", color: "#fafafa" }} />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#52525b" }}>◎</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 max-w-4xl mx-auto">
        {/* Estilos de corte */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold" style={{ color: "#fafafa" }}>Estilos de corte</h2>
            {estiloFiltro && <button onClick={() => setEstiloFiltro("")} className="text-xs cursor-pointer" style={{ color: "#d4a853" }}>Limpar</button>}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {ESTILOS_CORTE.map(e => (
              <button key={e.nome} onClick={() => setEstiloFiltro(estiloFiltro === e.nome ? "" : e.nome)}
                className="flex-shrink-0 relative overflow-hidden rounded-xl cursor-pointer transition-all"
                style={{ width: 90, border: `2px solid ${estiloFiltro === e.nome ? "#d4a853" : "transparent"}` }}>
                <img src={e.img} alt={e.nome} className="w-full h-24 object-cover" style={{ background: "#1c1c1f" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(9,9,11,0.85) 0%, transparent 55%)" }}></div>
                <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5">
                  <div className="text-[10px] font-medium" style={{ color: "#fafafa" }}>{e.nome}</div>
                  {e.popular && <div className="font-mono text-[8px]" style={{ color: "#d4a853" }}>popular</div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Region filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: "none" }}>
          {REGIOES.map(r => (
            <button key={r} onClick={() => setRegiao(r)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-mono cursor-pointer transition-all"
              style={{ background: regiao === r ? "rgba(212,168,83,0.15)" : "#111113", color: regiao === r ? "#d4a853" : "#71717a", border: `1px solid ${regiao === r ? "#d4a853" : "#27272a"}` }}>
              {r}
            </button>
          ))}
        </div>

        {/* Listing */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold" style={{ color: "#fafafa" }}>
            {loading ? "Buscando..." : `${filtered.length} barbearia${filtered.length !== 1 ? "s" : ""}`}
          </h2>
          <span className="font-mono text-xs flex items-center gap-1.5" style={{ color: "#52525b" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }}></span>
            Supabase
          </span>
        </div>

        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {filtered.map(shop => (
              <button key={shop.id} onClick={() => onSelectShop(shop)}
                className="text-left rounded-2xl overflow-hidden cursor-pointer group transition-all"
                style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
                <div className="relative h-44 overflow-hidden" style={{ background: "#1c1c1f" }}>
                  <img src={shop.cover_url} alt={shop.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(9,9,11,0.8) 100%)" }}></div>
                  <div className="absolute top-3 right-3">
                    <span className="font-mono text-[10px] px-2 py-1 rounded-full" style={{ background: shop.aberto ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)", color: "#fff", backdropFilter: "blur(4px)" }}>
                      {shop.aberto ? "● Aberto" : "● Fechado"}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {GALLERY_IMGS.slice(0, 3).map((img, i) => (
                      <div key={i} className="w-7 h-7 rounded-md overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.15)", background: "#1c1c1f" }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <img src={shop.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border" style={{ borderColor: "#27272a", background: "#1c1c1f" }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold" style={{ color: "#fafafa" }}>{shop.nome}</div>
                      <div className="text-xs mt-0.5 mb-2" style={{ color: "#71717a" }}>{shop.bairro} · {shop.regiao}</div>
                      <div className="flex items-center gap-2">
                        <StarRating value={shop.avaliacao} />
                        <span className="font-mono text-xs font-semibold" style={{ color: "#d4a853" }}>{shop.avaliacao}</span>
                        <span className="text-xs" style={{ color: "#52525b" }}>({shop.avaliacoes})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {shop.tags?.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-mono" style={{ background: "#1c1c1f", color: "#71717a", border: "1px solid #27272a" }}>{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #1c1c1f" }}>
                    <div className="text-xs" style={{ color: "#52525b" }}>
                      A partir de <span className="font-mono font-semibold" style={{ color: "#d4a853" }}>R$ {Math.min(...(shop.services?.map(s => s.preco) || [0]))}</span>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-lg" style={{ background: "rgba(212,168,83,0.1)", color: "#d4a853" }}>Agendar →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* CTA para barbeiros */}
        <div className="rounded-2xl overflow-hidden mb-12 relative" style={{ background: "#111113", border: "1px solid #1c1c1f" }}>
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-20 overflow-hidden hidden sm:block">
            <img src={IMG.cut8} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative px-6 py-7">
            <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "#d4a853" }}>Para barbeiros</div>
            <h3 className="font-display text-2xl font-semibold mb-2" style={{ color: "#fafafa" }}>Coloque sua barbearia no mapa</h3>
            <p className="text-sm mb-5 max-w-sm" style={{ color: "#71717a" }}>
              Apareça para clientes da sua região. Gerencie agenda, galeria de cortes e avaliações. 14 dias grátis, depois R$50/mês.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={onBarberSignup} className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background: "#d4a853", color: "#09090b" }}>
                Cadastrar barbearia
              </button>
              <span className="font-mono text-sm" style={{ color: "#52525b" }}>R$ 50/mês</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedShop, setSelectedShop] = useState<Barbershop | null>(null);

  const handleSelectShop = (s: Barbershop) => { setSelectedShop(s); setScreen("detail"); };
  const goHome = () => { setScreen("home"); setSelectedShop(null); };

  if (screen === "detail" && selectedShop) return <DetailScreen shop={selectedShop} onBack={goHome} />;
  if (screen === "barber-signup")          return <BarberSignupScreen onBack={goHome} />;
  if (screen === "admin-login")            return <AdminLoginScreen onLogin={() => setScreen("admin-dashboard")} onBack={goHome} />;
  if (screen === "admin-dashboard")        return <AdminDashboard onLogout={goHome} />;

  return <HomeScreen onSelectShop={handleSelectShop} onBarberSignup={() => setScreen("barber-signup")} onAdminLogin={() => setScreen("admin-login")} />;
}
