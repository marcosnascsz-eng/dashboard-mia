import { useState, useEffect, useRef } from "react";

const T = {
  accent: "#efa000", bg: "#0a0a0a", card: "#111", cardH: "#161616",
  border: "#1c1c1c", text: "#e0e0e0", muted: "#888", dim: "#555",
  warm: "#efa000", lw: "#f4c45c", cold: "#8cb4c9", sold: "#6fcf97", lost: "#e05c5c",
  blue: "#5ba4d9", purple: "#8b5cf6", font: "'DM Sans',system-ui,sans-serif",
};

/* ── SVG Donut ── */
function Donut({ data, size = 180, title }) {
  const cx = size / 2, cy = size / 2, r = size * 0.35, r2 = size * 0.25;
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = -90;
  const arcs = data.map((d) => {
    const ang = (d.value / total) * 360, start = cum; cum += ang;
    const s = (start * Math.PI) / 180, en = ((start + ang) * Math.PI) / 180, large = ang > 180 ? 1 : 0;
    const path = `M${cx + r * Math.cos(s)},${cy + r * Math.sin(s)} A${r},${r} 0 ${large},1 ${cx + r * Math.cos(en)},${cy + r * Math.sin(en)} L${cx + r2 * Math.cos(en)},${cy + r2 * Math.sin(en)} A${r2},${r2} 0 ${large},0 ${cx + r2 * Math.cos(s)},${cy + r2 * Math.sin(s)} Z`;
    const mid = ((start + ang / 2) * Math.PI) / 180;
    return { ...d, path, lx: cx + (r + 18) * Math.cos(mid), ly: cy + (r + 18) * Math.sin(mid), pct: Math.round((d.value / total) * 100) };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {title && <span style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{title}</span>}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} />)}
        {arcs.map((a, i) => a.pct > 4 && <text key={"t" + i} x={a.lx} y={a.ly} textAnchor="middle" dominantBaseline="central" fill="#ccc" fontSize={11} fontWeight={600}>{a.pct}%</text>)}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "5px 14px" }}>
        {data.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#aaa" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />{d.name}</div>)}
      </div>
    </div>
  );
}

/* ── SVG Bar ── */
function BarChart({ data, width = 560, height = 260 }) {
  const mx = Math.max(...data.map((d) => Math.max(d.meta, d.realizado)), 1);
  const gap = (width - 50) / data.length, bw = Math.min(16, gap * 0.35);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => { const y = height - height * f; return <g key={i}><line x1={45} y1={y} x2={width} y2={y} stroke="#1c1c1c" strokeDasharray="3 3" /><text x={40} y={y + 4} textAnchor="end" fill={T.dim} fontSize={9}>{Math.round((mx * f) / 1000)}k</text></g>; })}
      {data.map((d, i) => { const x = 55 + i * gap; return <g key={i}><rect x={x} y={height - (d.meta / mx) * height} width={bw} height={(d.meta / mx) * height} rx={3} fill="#efa00044" /><rect x={x + bw + 2} y={height - (d.realizado / mx) * height} width={bw} height={(d.realizado / mx) * height} rx={3} fill="#efa000" /><text x={x + bw} y={height + 15} textAnchor="middle" fill={T.dim} fontSize={9}>{d.mes}</text></g>; })}
    </svg>
  );
}

/* ── Shared ── */
function AnimNum({ target, prefix = "", suffix = "", decimals = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => { let s = 0; const inc = (target / 1200) * 16; const id = setInterval(() => { s += inc; if (s >= target) { setV(target); clearInterval(id); } else setV(s); }, 16); return () => clearInterval(id); }, [target]);
  return <span>{prefix}{decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("pt-BR")}{suffix}</span>;
}

function KPI({ label, value, prefix, suffix, decimals, sub, accent }) {
  const [h, setH] = useState(false);
  return (
    <div style={{ background: T.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${h ? accent || T.accent : T.border}`, position: "relative", overflow: "hidden", transition: "all .3s", transform: h ? "translateY(-2px)" : "none" }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent || T.accent, borderRadius: "14px 0 0 14px" }} />
      <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#f0f0f0" }}><AnimNum target={value} prefix={prefix} suffix={suffix} decimals={decimals} /></div>
      {sub && <div style={{ fontSize: 11, color: T.dim, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function BigCard({ title, value, sub, gradient }) {
  return <div style={{ borderRadius: 16, padding: 24, background: gradient, color: "#fff" }}><div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 4 }}>{title}</div><div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}><AnimNum target={value} /><span style={{ fontSize: 13, opacity: 0.8 }}>,00</span></div><div style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>{sub}</div></div>;
}

function MiaLogo({ size = 36, onClick, animated }) {
  const [h, setH] = useState(false);
  return <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick} style={{ fontSize: size, fontWeight: 800, color: T.accent, letterSpacing: "-0.04em", cursor: onClick ? "pointer" : "default", userSelect: "none", display: "inline-block", transition: "all .4s cubic-bezier(.16,1,.3,1)", transform: animated && h ? "scale(1.15) rotate(-2deg)" : "scale(1)", textShadow: animated && h ? `0 0 30px ${T.accent}66` : "none" }}>mia</span>;
}

function Modal({ children, onClose }) {
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div onClick={(e) => e.stopPropagation()} style={{ background: "#141414", borderRadius: 20, border: `1px solid ${T.border}`, padding: 32, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>{children}</div></div>;
}

function UserMenu() {
  const [o, setO] = useState(false);
  return <div style={{ position: "relative" }}><div onClick={() => setO(!o)} style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#efa000,#d4784a)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff", border: "2px solid #222" }}>C</div>{o && <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#1a1a1a", border: `1px solid ${T.border}`, borderRadius: 12, padding: 6, minWidth: 160, boxShadow: "0 12px 40px rgba(0,0,0,.6)", zIndex: 300 }}><div style={{ padding: "8px 14px", fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}`, marginBottom: 4 }}><div style={{ fontWeight: 700, color: T.text }}>César Oliveira</div><div style={{ fontSize: 11 }}>cesar@orbe.com.br</div></div><button onClick={() => setO(false)} style={{ width: "100%", padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: T.accent, fontSize: 13, fontWeight: 600, textAlign: "left", fontFamily: T.font }}>Convidar</button><button onClick={() => setO(false)} style={{ width: "100%", padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: T.lost, fontSize: 13, fontWeight: 600, textAlign: "left", fontFamily: T.font }}>Sair</button></div>}</div>;
}

function DateFilter({ from, to, setFrom, setTo }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, borderRadius: 10, padding: "6px 14px", border: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 11, color: T.dim, fontWeight: 600 }}>Período:</span>
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#0e0e0e", color: T.text, fontSize: 12, outline: "none" }} />
      <span style={{ color: T.dim, fontSize: 12 }}>até</span>
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#0e0e0e", color: T.text, fontSize: 12, outline: "none" }} />
      {(from || to) && <button onClick={() => { setFrom(""); setTo(""); }} style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: "#1a1a1a", color: T.muted, fontSize: 11, fontFamily: T.font }}>Limpar</button>}
    </div>
  );
}

const inp = { width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#0e0e0e", color: T.text, fontSize: 13, fontFamily: T.font, outline: "none" };

/* ── Data ── */
const TEMPS = ["Quente", "Morno", "Frio", "Vendido", "Perdido"];
const TS = { Quente: { bg: "#efa000", fg: "#fff" }, Morno: { bg: "#f4c45c", fg: "#222" }, Frio: { bg: "#8cb4c9", fg: "#fff" }, Vendido: { bg: "#6fcf97", fg: "#fff" }, Perdido: { bg: "#e05c5c", fg: "#fff" } };
const ORIGINS = ["Arquiteto ou Designer", "Porta", "Indicação", "Captação", "Internet", "Cliente", "Construtora ou Corretores"];
const OC = { "Arquiteto ou Designer": "#8b5cf6", Porta: "#efa000", "Indicação": "#e05c5c", Captação: "#888", Internet: "#6fcf97", Cliente: "#8cb4c9", "Construtora ou Corretores": "#f4c45c" };
const TEAM = ["César", "Mariana", "Rafael", "Ana"];
const LOST = ["Preço", "Prazo", "Incontatável", "Fechou com outro", "Desistiu", "Outros"];
const PS_LIST = ["Black", "Em desenvolvimento", "Contato", "Incontatável", "Orçando"];
const PSS = { Black: { bg: "#222", fg: "#fff" }, "Em desenvolvimento": { bg: "#2e2000", fg: "#f4c45c" }, Contato: { bg: "#162e1c", fg: "#6fcf97" }, "Incontatável": { bg: "#2e1616", fg: "#e05c5c" }, "Orçando": { bg: "#1e2a3a", fg: "#5ba4d9" } };
const EVT_LIST = ["Convidado", "Confirmado", "Não respondeu", "RSVP", "Não vem"];
const EVT_S = { Convidado: { bg: "#2e2000", fg: "#f4c45c" }, Confirmado: { bg: "#162e1c", fg: "#6fcf97" }, "Não respondeu": { bg: "#1a1a1a", fg: "#888" }, RSVP: { bg: "#1e2a3a", fg: "#5ba4d9" }, "Não vem": { bg: "#2e1616", fg: "#e05c5c" } };
const PVS = ["Contrato", "Medição", "Briefing", "Estudo de Layout", "Projeto 3D", "Orçamentos", "Executivo", "Fotos", "Instalação", "Entrega"];

const initCRM = [
  { id: 1, cliente: "AP BOSQUE PINHEIROS", origem: "Arquiteto ou Designer", parceiro: "RODRIGO COLOMBO", valor: 28700, dataEntrada: "13/02/2026", agenda: "22/04/2026", temp: "Frio", contato: "+5511949421098", equipe: "César", nota: "" },
  { id: 2, cliente: "DANIELA & JULIO", origem: "Arquiteto ou Designer", parceiro: "BMA ARQUITETURA", valor: 16097, dataEntrada: "18/02/2026", agenda: "23/04/2026", temp: "Morno", contato: "5511916034992", equipe: "César", nota: "Reforma cozinha e lavabo. Preferem tons neutros." },
  { id: 3, cliente: "ANA & MAURO", origem: "Arquiteto ou Designer", parceiro: "ISABELLA NALINI", valor: 18920, dataEntrada: "20/02/2026", agenda: "24/04/2026", temp: "Morno", contato: "+5511986519923", equipe: "César", nota: "" },
  { id: 4, cliente: "GILBERTO & ELAINE", origem: "Arquiteto ou Designer", parceiro: "ALTERA ARQUITETURA", valor: 49400, dataEntrada: "02/03/2026", agenda: "25/04/2026", temp: "Morno", contato: "113 032-6458", equipe: "César", nota: "" },
  { id: 5, cliente: "MARCOS VIEIRA", origem: "Indicação", parceiro: "GREENERGY CO", valor: 35200, dataEntrada: "10/03/2026", agenda: "26/04/2026", temp: "Quente", contato: "+5521976543210", equipe: "Mariana", nota: "Já fechou 2 projetos com a agência." },
  { id: 6, cliente: "PEDRO ALVES", origem: "Captação", parceiro: "FINTECH SP", valor: 95000, dataEntrada: "01/04/2026", agenda: "", temp: "Vendido", contato: "+5511976543210", equipe: "Ana", nota: "" },
  { id: 7, cliente: "CAMILA RODRIGUES", origem: "Porta", parceiro: "E-SHOP RIO", valor: 54000, dataEntrada: "05/03/2026", agenda: "", temp: "Perdido", contato: "+5521965432109", equipe: "César", nota: "" },
];
const initPV = [
  { id: 1, client: "Rafael Lima", co: "Digital PR", stage: "Instalação", si: 8, prog: 90, ctr: 32000, rec: 28800, ar: 3200, pdf: null, start: "2026-01-15", end: "2026-04-22" },
  { id: 2, client: "Thiago Santos", co: "LogTech", stage: "Projeto 3D", si: 4, prog: 50, ctr: 85000, rec: 42500, ar: 42500, pdf: null, start: "2026-02-10", end: "2026-05-30" },
  { id: 3, client: "Bianca Martins", co: "FoodTech", stage: "Briefing", si: 2, prog: 20, ctr: 18500, rec: 5550, ar: 12950, pdf: null, start: "2026-03-20", end: "2026-06-15" },
  { id: 4, client: "Diego Ramos", co: "AutoParts", stage: "Orçamentos", si: 5, prog: 60, ctr: 54000, rec: 32400, ar: 21600, pdf: null, start: "2026-02-01", end: "2026-05-10" },
  { id: 5, client: "Isabela Nunes", co: "EduTech", stage: "Entrega", si: 9, prog: 100, ctr: 67000, rec: 67000, ar: 0, pdf: null, start: "2025-11-10", end: "2026-04-05" },
  { id: 6, client: "Marcos Vieira", co: "GreenEnergy", stage: "Executivo", si: 6, prog: 70, ctr: 95000, rec: 66500, ar: 28500, pdf: null, start: "2026-01-20", end: "2026-05-25" },
];
const metasData = [{ mes: "Jan", meta: 120000, realizado: 98000 }, { mes: "Fev", meta: 120000, realizado: 115000 }, { mes: "Mar", meta: 150000, realizado: 142000 }, { mes: "Abr", meta: 150000, realizado: 160000 }, { mes: "Mai", meta: 180000, realizado: 0 }, { mes: "Jun", meta: 180000, realizado: 0 }, { mes: "Jul", meta: 200000, realizado: 0 }, { mes: "Ago", meta: 200000, realizado: 0 }, { mes: "Set", meta: 220000, realizado: 0 }, { mes: "Out", meta: 220000, realizado: 0 }, { mes: "Nov", meta: 250000, realizado: 0 }, { mes: "Dez", meta: 250000, realizado: 0 }];
const initLanc = [
  { id: 1, data: "02/04", desc: "Aluguel escritório", tipo: "D", v: 8500 },
  { id: 2, data: "03/04", desc: "Salários equipe", tipo: "D", v: 45000 },
  { id: 3, data: "05/04", desc: "Google Ads", tipo: "D", v: 12800 },
  { id: 4, data: "08/04", desc: "Projeto Rafael Lima", tipo: "R", v: 32000 },
  { id: 5, data: "10/04", desc: "Projeto Thiago", tipo: "R", v: 85000 },
  { id: 6, data: "12/04", desc: "Material de obra", tipo: "D", v: 18700 },
  { id: 7, data: "13/04", desc: "Projeto Pedro Alves", tipo: "R", v: 95000 },
];
const initPartners = [
  { id: 1, nome: "RODRIGO COLOMBO", email: "rodrigo@arq.com", tel: "(11) 98765-4321", insta: "@rodrigocolombo", aniv: "15/03", ult: "10/04/2026", status: "Black", total: 128700, evento: "Confirmado" },
  { id: 2, nome: "BMA ARQUITETURA", email: "contato@bma.arq.br", tel: "(11) 91234-5678", insta: "@bmaarquitetura", aniv: "22/07", ult: "11/04/2026", status: "Contato", total: 95000, evento: "Convidado" },
  { id: 3, nome: "ISABELLA NALINI", email: "isabella@nalini.arq", tel: "(11) 99876-5432", insta: "@isanalini", aniv: "08/11", ult: "05/03/2026", status: "Em desenvolvimento", total: 78920, evento: "Não respondeu" },
  { id: 4, nome: "PAULA LILIAN ARCH", email: "paula@plarch.com", tel: "(11) 98905-1447", insta: "@paulalilian.arch", aniv: "02/09", ult: "17/04/2026", status: "Black", total: 162931, evento: "Confirmado" },
  { id: 5, nome: "ALTERA ARQUITETURA", email: "proj@altera.arq.br", tel: "(11) 93032-6458", insta: "@altera.arq", aniv: "30/05", ult: "09/03/2026", status: "Orçando", total: 49400, evento: "RSVP" },
  { id: 6, nome: "GREENERGY CO", email: "marcos@greenergy.co", tel: "(21) 97654-3210", insta: "@greenergy.co", aniv: "19/06", ult: "22/04/2026", status: "Contato", total: 35200, evento: "Não vem" },
];

const initCampaigns = [
  { id: 1, name: "Promoção Outono 2026", platform: "Google Ads", status: "andamento", cliques: 3420, impressoes: 98500, gasto: 12800, ctr: 3.47, cpc: 3.74, conv: 87 },
  { id: 2, name: "Lançamento Linha Premium", platform: "Meta Ads", status: "andamento", cliques: 2890, impressoes: 124300, gasto: 9600, ctr: 2.32, cpc: 3.32, conv: 74 },
  { id: 3, name: "Retargeting Abandoned Cart", platform: "Meta Ads", status: "andamento", cliques: 1950, impressoes: 45200, gasto: 4200, ctr: 4.31, cpc: 2.15, conv: 62 },
  { id: 4, name: "Black Friday Arquitetos", platform: "Google Ads", status: "encerrada", cliques: 8920, impressoes: 245000, gasto: 28500, ctr: 3.64, cpc: 3.19, conv: 312 },
  { id: 5, name: "Teste Awareness TikTok", platform: "TikTok Ads", status: "pausada", cliques: 1120, impressoes: 67800, gasto: 2400, ctr: 1.65, cpc: 2.14, conv: 12 },
  { id: 6, name: "Campanha Verão 2026", platform: "Google Ads", status: "encerrada", cliques: 5670, impressoes: 178400, gasto: 18200, ctr: 3.18, cpc: 3.21, conv: 198 },
  { id: 7, name: "LinkedIn B2B Arquitetos", platform: "LinkedIn Ads", status: "pausada", cliques: 450, impressoes: 12300, gasto: 3800, ctr: 3.66, cpc: 8.44, conv: 23 },
];

const CAMP_STATUS = { andamento: { bg: "#162e1c", fg: "#6fcf97", label: "Em andamento" }, pausada: { bg: "#2e2000", fg: "#f4c45c", label: "Pausada" }, encerrada: { bg: "#1a1a1a", fg: "#888", label: "Encerrada" } };

/* ═══ HOME ═══ */
function HomePage({ go }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { setTimeout(() => setOk(true), 100); }, []);
  const cards = [
    { k: "camp", t: "Campanhas", d: "Gerencie seus anúncios aqui.", c: "#efa000", i: "◎" },
    { k: "crm", t: "CRM", d: "Sua carteira de clientes ao seu alcance.", c: "#f4c45c", i: "◉" },
    { k: "pv", t: "Pós-Venda", d: "Acompanhe cada etapa da obra.", c: "#d4784a", i: "◈" },
    { k: "fin", t: "Financeiro", d: "Metas, despesas e margem.", c: "#8cb4c9", i: "◇" },
    { k: "par", t: "Parceiros", d: "Gerencie seus parceiros.", c: "#8b5cf6", i: "◆" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: T.font, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(239,160,0,0.08),transparent 70%)", pointerEvents: "none" }} />
      <div style={{ opacity: ok ? 1 : 0, transform: ok ? "translateY(0)" : "translateY(30px)", transition: "all .8s cubic-bezier(.16,1,.3,1)", textAlign: "center", zIndex: 1 }}>
        <MiaLogo size={80} animated />
        <p style={{ fontSize: 14, color: T.accent, margin: "12px 0 44px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>marketing e aceleração para arquitetura</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", maxWidth: 1150 }}>
          {cards.map((c, i) => <HomeCard key={c.k} c={c} i={i} ok={ok} go={go} />)}
        </div>
        <div style={{ marginTop: 32, opacity: ok ? 1 : 0, transition: "all .6s", transitionDelay: "600ms" }}>
          <button style={{ width: "100%", maxWidth: 1060, padding: "14px 40px", borderRadius: 14, border: `1px solid ${T.accent}44`, cursor: "pointer", background: "transparent", color: T.accent, fontSize: 15, fontWeight: 700, fontFamily: T.font, transition: "all .3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = T.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.accent; }}>
            Convidar um Parceiro
          </button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 24, fontSize: 11, color: "#333" }}>© 2026 mia · Powered by Orbe</div>
    </div>
  );
}
function HomeCard({ c, i, ok, go }) {
  const [h, setH] = useState(false);
  return <div onClick={() => go(c.k)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ width: 200, padding: "28px 20px", borderRadius: 20, background: h ? "#151515" : T.card, border: `1px solid ${h ? c.c : T.border}`, cursor: "pointer", textAlign: "center", transition: "all .4s cubic-bezier(.16,1,.3,1)", transform: ok ? (h ? "translateY(-6px)" : "translateY(0)") : "translateY(20px)", opacity: ok ? 1 : 0, transitionDelay: `${i * 100}ms`, boxShadow: h ? `0 16px 48px ${c.c}22` : "none" }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.c}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 20, color: c.c, border: `1px solid ${c.c}33` }}>{c.i}</div>
    <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: T.text }}>{c.t}</h3>
    <p style={{ margin: 0, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{c.d}</p>
    <div style={{ marginTop: 14, fontSize: 11, color: c.c, fontWeight: 600, opacity: h ? 1 : 0, transition: "all .3s" }}>Acessar →</div>
  </div>;
}

/* ═══ CAMPANHAS ═══ */
function CampPage() {
  const [df, setDf] = useState(""); const [dt, setDt] = useState("");
  const [filter, setFilter] = useState("all");
  const mc = [{ l: "Conversas Iniciadas", v: 73, i: "💬" }, { l: "Cliques no Link", v: 96, i: "👆" }, { l: "Impressões", v: 20415, i: "👁" }, { l: "Alcance", v: 11030, i: "🌐" }];

  const filtered = filter === "all" ? initCampaigns : initCampaigns.filter((c) => c.status === filter);
  const counts = { all: initCampaigns.length, andamento: initCampaigns.filter((c) => c.status === "andamento").length, pausada: initCampaigns.filter((c) => c.status === "pausada").length, encerrada: initCampaigns.filter((c) => c.status === "encerrada").length };

  return (<>
    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <a href="https://adsmanager.facebook.com" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: T.card, border: `1px solid ${T.border}`, color: T.text, textDecoration: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "border-color .3s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1877F2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" /></svg>
          Meta Ads
        </a>
        <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: T.card, border: `1px solid ${T.border}`, color: T.text, textDecoration: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "border-color .3s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4285F4"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
          Google Ads
        </a>
      </div>
      <div style={{ flex: 1 }} />
      <DateFilter from={df} to={dt} setFrom={setDf} setTo={setDt} />
    </div>

    <div style={{ background: "linear-gradient(135deg,#2a2a2a,#1a1a1a,#222)", borderRadius: 16, padding: "28px 20px", marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, border: `1px solid ${T.border}` }}>
      {mc.map((m, i) => <div key={i} style={{ textAlign: "center", padding: "10px 0" }}><div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}><AnimNum target={m.v} /></div><div style={{ margin: "8px 0 10px", display: "inline-block", padding: "4px 16px", borderRadius: 4, background: T.accent, color: T.bg, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{m.l}</div><div style={{ fontSize: 28, opacity: 0.5 }}>{m.i}</div></div>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
      <KPI label="Investimento total" value={120800} prefix="R$ " accent="#efa000" sub="Abr 2026" /><KPI label="Leads gerados" value={950} accent="#f4c45c" /><KPI label="Conversões" value={240} accent="#d4784a" /><KPI label="CPC médio" value={3.49} prefix="R$ " decimals={2} accent="#8cb4c9" /><KPI label="ROI geral" value={287} suffix="%" accent="#c9a87c" />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
      <div style={{ background: T.card, borderRadius: 16, padding: 22, border: `1px solid ${T.border}`, display: "flex", justifyContent: "center" }}><Donut data={[{ name: "Google", value: 35, color: "#efa000" }, { name: "Meta", value: 28, color: "#f4c45c" }, { name: "TikTok", value: 18, color: "#d4784a" }, { name: "LinkedIn", value: 12, color: "#8cb4c9" }, { name: "Twitter/X", value: 7, color: "#c9a87c" }]} title="Distribuição por Canal" size={200} /></div>
      <div style={{ background: T.card, borderRadius: 16, padding: 22, border: `1px solid ${T.border}`, display: "flex", justifyContent: "center" }}><Donut data={[{ name: "Mobile", value: 68, color: "#efa000" }, { name: "Desktop", value: 27, color: "#8cb4c9" }, { name: "Tablet", value: 5, color: "#c9a87c" }]} title="Dispositivos" size={200} /></div>
    </div>

    {/* Lista de campanhas */}
    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Campanhas</span>
        <div style={{ display: "flex", gap: 4, background: "#0d0d0d", borderRadius: 8, padding: 3, border: `1px solid ${T.border}` }}>
          {[
            { k: "all", l: "Todas", c: T.accent },
            { k: "andamento", l: "Em andamento", c: T.sold },
            { k: "pausada", l: "Pausadas", c: T.lw },
            { k: "encerrada", l: "Encerradas", c: T.muted },
          ].map((f) => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: filter === f.k ? f.c : "transparent", color: filter === f.k ? T.bg : T.muted, fontSize: 11, fontWeight: 600, fontFamily: T.font, transition: "all .2s" }}>
              {f.l} <span style={{ opacity: 0.6, marginLeft: 4 }}>({counts[f.k]})</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d0d0d" }}>
              {["Campanha", "Plataforma", "Status", "Cliques", "Impressões", "CTR", "CPC", "Conv.", "Gasto"].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const s = CAMP_STATUS[c.status];
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #141414" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#131313"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "12px 14px", color: T.muted, fontSize: 12 }}>{c.platform}</td>
                  <td style={{ padding: "12px 14px" }}><span style={{ padding: "4px 12px", borderRadius: 6, background: s.bg, color: s.fg, fontSize: 11, fontWeight: 600 }}>{s.label}</span></td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>{c.cliques.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: T.muted }}>{c.impressoes.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>{c.ctr.toFixed(2)}%</td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>R$ {c.cpc.toFixed(2)}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: T.sold }}>{c.conv}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: T.accent }}>R$ {c.gasto.toLocaleString("pt-BR")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </>);
}

/* ═══ CRM ═══ */
function CRMPage() {
  const [rows, setRows] = useState(initCRM); const [ec, setEc] = useState(null);
  const [cm, setCm] = useState(null); const [lm, setLm] = useState(null);
  const [ct, setCt] = useState({ nome: "", cnpj: "", end: "", val: "", parc: "", dt: "", obs: "" });
  const [sf, setSf] = useState(false);
  const [nf, setNf] = useState({ cliente: "", origem: "", parceiro: "", valor: "", temp: "Morno", contato: "", equipe: TEAM[0], dataEntrada: "", agenda: "" });
  const [df, setDf] = useState(""); const [dt2, setDt2] = useState("");
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState("");

  const tO = rows.reduce((s, r) => s + r.valor, 0), tV = rows.filter((r) => r.temp === "Vendido").reduce((s, r) => s + r.valor, 0), tP = rows.filter((r) => r.temp === "Perdido").reduce((s, r) => s + r.valor, 0);
  const chg = (id, t) => { if (t === "Vendido") { const row = rows.find((r) => r.id === id); setCt({ nome: row?.cliente || "", cnpj: "", end: "", val: String(row?.valor || ""), parc: "", dt: "", obs: "" }); setCm(id); return; } if (t === "Perdido") { setLm(id); return; } setRows(rows.map((r) => (r.id === id ? { ...r, temp: t } : r))); setEc(null); };
  const addRow = () => { if (!nf.cliente) return; setRows([...rows, { id: Date.now(), cliente: nf.cliente.toUpperCase(), origem: nf.origem || "Internet", parceiro: nf.parceiro.toUpperCase(), valor: parseFloat(nf.valor) || 0, dataEntrada: nf.dataEntrada || new Date().toLocaleDateString("pt-BR"), agenda: nf.agenda, temp: nf.temp, contato: nf.contato, equipe: nf.equipe, nota: "" }]); setNf({ cliente: "", origem: "", parceiro: "", valor: "", temp: "Morno", contato: "", equipe: TEAM[0], dataEntrada: "", agenda: "" }); setSf(false); };
  const openNote = (id) => { const row = rows.find((r) => r.id === id); setNoteText(row?.nota || ""); setNoteModal(id); };
  const saveNote = () => { setRows(rows.map((r) => (r.id === noteModal ? { ...r, nota: noteText } : r))); setNoteModal(null); };

  // Agenda panel: generate current week
  const today = new Date("2026-04-22");
  const weekDays = [];
  const startWeek = new Date(today); startWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  for (let i = 0; i < 7; i++) {
    const d = new Date(startWeek); d.setDate(startWeek.getDate() + i);
    weekDays.push(d);
  }
  const parseBR = (s) => { if (!s) return null; const p = s.split("/"); return p.length === 3 ? new Date(p[2], p[1] - 1, p[0]) : null; };
  const sameDay = (a, b) => a && b && a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const agendados = rows.filter((r) => r.agenda);

  return (<>
    {cm && <Modal onClose={() => { setCm(null); setEc(null); }}><h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.sold }}>Gerar Contrato</h3><div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>{[{ l: "Nome completo", k: "nome" }, { l: "CNPJ / CPF", k: "cnpj" }, { l: "Endereço", k: "end" }, { l: "Valor (R$)", k: "val" }, { l: "Parcelas", k: "parc" }, { l: "Data início", k: "dt" }].map((f) => <div key={f.k}><label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>{f.l}</label><input value={ct[f.k]} onChange={(e) => setCt({ ...ct, [f.k]: e.target.value })} style={inp} /></div>)}<div><label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>Observações</label><textarea value={ct.obs} onChange={(e) => setCt({ ...ct, obs: e.target.value })} style={{ ...inp, minHeight: 60, resize: "vertical" }} /></div><div style={{ display: "flex", gap: 10 }}><button onClick={() => { setRows(rows.map((r) => (r.id === cm ? { ...r, temp: "Vendido" } : r))); setCm(null); setEc(null); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", background: T.sold, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: T.font }}>Gerar Contrato</button><button onClick={() => { setCm(null); setEc(null); }} style={{ padding: "12px 20px", borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer", background: "transparent", color: T.muted, fontSize: 13, fontFamily: T.font }}>Cancelar</button></div></div></Modal>}
    {lm && <Modal onClose={() => { setLm(null); setEc(null); }}><h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.lost }}>Motivo da Perda</h3><div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>{LOST.map((r) => <button key={r} onClick={() => { setRows(rows.map((x) => (x.id === lm ? { ...x, temp: "Perdido" } : x))); setLm(null); setEc(null); }} style={{ padding: "14px 20px", borderRadius: 12, border: `1px solid ${T.border}`, cursor: "pointer", background: T.card, color: T.text, fontSize: 14, fontWeight: 600, textAlign: "left", fontFamily: T.font }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.lost; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}>{r}</button>)}</div></Modal>}
    {sf && <Modal onClose={() => setSf(false)}><h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: T.accent }}>Nova Oportunidade</h3><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[{ l: "Cliente", k: "cliente" }, { l: "Parceiro", k: "parceiro" }, { l: "Valor do orçamento", k: "valor" }, { l: "Data entrada", k: "dataEntrada" }, { l: "Agenda", k: "agenda" }, { l: "Contato", k: "contato" }].map((f) => <div key={f.k}><label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>{f.l}</label><input value={nf[f.k]} onChange={(e) => setNf({ ...nf, [f.k]: e.target.value })} style={inp} placeholder={f.l} /></div>)}<div><label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>Origem</label><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{ORIGINS.map((o) => <button key={o} onClick={() => setNf({ ...nf, origem: o })} style={{ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: nf.origem === o ? (OC[o] || "#555") : "#1a1a1a", color: nf.origem === o ? "#fff" : T.dim, fontSize: 10, fontWeight: 600, fontFamily: T.font }}>{o.length > 16 ? o.slice(0, 14) + "…" : o}</button>)}</div></div><div><label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>Temperatura</label><div style={{ display: "flex", gap: 5 }}>{TEMPS.map((t) => <button key={t} onClick={() => setNf({ ...nf, temp: t })} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: nf.temp === t ? TS[t].bg : "#1a1a1a", color: nf.temp === t ? TS[t].fg : T.dim, fontSize: 11, fontWeight: 600, fontFamily: T.font }}>{t}</button>)}</div></div><div style={{ display: "flex", gap: 10, marginTop: 4 }}><button onClick={addRow} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: T.bg, fontSize: 14, fontWeight: 700, fontFamily: T.font }}>Enviar</button><button onClick={() => setSf(false)} style={{ padding: "12px 20px", borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer", background: "transparent", color: T.muted, fontSize: 13, fontFamily: T.font }}>Cancelar</button></div></div></Modal>}
    {noteModal !== null && <Modal onClose={() => setNoteModal(null)}>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: T.accent }}>Informações do Cliente</h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: T.muted }}>{rows.find((r) => r.id === noteModal)?.cliente}</p>
      <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} style={{ ...inp, minHeight: 200, resize: "vertical", lineHeight: 1.6 }} placeholder="Escreva aqui informações importantes sobre este cliente: preferências, observações, histórico de conversas..." autoFocus />
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={saveNote} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: T.bg, fontSize: 14, fontWeight: 700, fontFamily: T.font }}>Salvar</button>
        <button onClick={() => setNoteModal(null)} style={{ padding: "12px 20px", borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer", background: "transparent", color: T.muted, fontSize: 13, fontFamily: T.font }}>Cancelar</button>
      </div>
    </Modal>}

    <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
      <DateFilter from={df} to={dt2} setFrom={setDf} setTo={setDt2} />
      <div style={{ flex: 1 }} />
      <button onClick={() => setSf(true)} style={{ padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: T.bg, fontSize: 13, fontWeight: 700, fontFamily: T.font }}>+ Nova Oportunidade</button>
      <button style={{ padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", background: T.blue, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: T.font }}>↗ Compartilhar Carteira</button>
    </div>

    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 22 }}>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1000 }}><thead><tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d0d0d" }}>{["Cliente", "Origem", "Parceiro", "Valor", "Data", "Temperatura", "Orçamento", "Info", "Contato", "Equipe"].map((h) => <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", borderRight: "1px solid #1a1a1a" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} style={{ borderBottom: "1px solid #141414" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#131313"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
          <td style={{ padding: "10px 12px", fontWeight: 600, borderRight: "1px solid #1a1a1a", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.cliente}</td>
          <td style={{ padding: "10px 12px", borderRight: "1px solid #1a1a1a" }}><span style={{ padding: "3px 10px", borderRadius: 6, background: OC[r.origem] || "#555", color: "#fff", fontSize: 10, fontWeight: 600 }}>{r.origem.length > 14 ? r.origem.slice(0, 12) + "…" : r.origem}</span></td>
          <td style={{ padding: "10px 12px", borderRight: "1px solid #1a1a1a", color: T.muted, fontSize: 12 }}>{r.parceiro}</td>
          <td style={{ padding: "10px 12px", borderRight: "1px solid #1a1a1a", fontFamily: "monospace", fontSize: 12 }}>{r.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
          <td style={{ padding: "10px 12px", borderRight: "1px solid #1a1a1a", fontSize: 12, color: T.muted }}>{r.dataEntrada}</td>
          <td style={{ padding: "10px 12px", borderRight: "1px solid #1a1a1a", position: "relative" }}><span onClick={() => setEc(ec === r.id ? null : r.id)} style={{ padding: "4px 12px", borderRadius: 6, background: TS[r.temp].bg, color: TS[r.temp].fg, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{r.temp} ▾</span>{ec === r.id && <div style={{ position: "absolute", top: "100%", left: 4, zIndex: 50, background: "#1a1a1a", border: `1px solid ${T.border}`, borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 3, boxShadow: "0 12px 40px rgba(0,0,0,.6)" }}>{TEMPS.map((t) => <button key={t} onClick={() => chg(r.id, t)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: TS[t].bg, color: TS[t].fg, fontSize: 11, fontWeight: 600, textAlign: "left", fontFamily: T.font }}>{t}</button>)}</div>}</td>
          <td style={{ padding: "10px 12px", borderRight: "1px solid #1a1a1a" }}><button style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${T.accent}44`, cursor: "pointer", background: `${T.accent}15`, color: T.accent, fontSize: 11, fontWeight: 600, fontFamily: T.font }} onMouseEnter={(e) => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = T.bg; }} onMouseLeave={(e) => { e.currentTarget.style.background = `${T.accent}15`; e.currentTarget.style.color = T.accent; }}>Gerar Orçamento</button></td>
          <td style={{ padding: "10px 12px", borderRight: "1px solid #1a1a1a" }}>
            <button onClick={() => openNote(r.id)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${r.nota ? T.sold + "44" : T.border}`, cursor: "pointer", background: r.nota ? T.sold + "15" : "#1a1a1a", color: r.nota ? T.sold : T.muted, fontSize: 11, fontWeight: 600, fontFamily: T.font, display: "flex", alignItems: "center", gap: 4 }}>
              📝 {r.nota ? "Ver nota" : "+ Nota"}
            </button>
          </td>
          <td style={{ padding: "10px 12px", borderRight: "1px solid #1a1a1a", fontFamily: "monospace", fontSize: 11, color: T.muted }}>{r.contato}</td>
          <td style={{ padding: "10px 12px" }}><span style={{ padding: "4px 10px", borderRadius: 6, background: "#1a3a2a", color: T.sold, fontSize: 11, fontWeight: 600 }}>{r.equipe}</span></td>
        </tr>)}</tbody></table></div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 18, display: "flex", justifyContent: "center" }}><Donut data={[{ name: "Quente", value: 17, color: "#8b5cf6" }, { name: "Vendido", value: 33, color: "#3b82f6" }, { name: "Perdido", value: 50, color: "#6fcf97" }]} title="Taxa de Conversão" size={190} /></div>
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 18, display: "flex", justifyContent: "center" }}><Donut data={[{ name: "Vendido", value: 46, color: "#3b82f6" }, { name: "Perdido", value: 9, color: "#6fcf97" }, { name: "Quente", value: 45, color: "#8b5cf6" }]} title="Mercado" size={190} /></div>
      </div>

      {/* Painel de Agenda */}
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>📅 Agenda da Semana</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {weekDays.map((d, i) => {
            const clientes = agendados.filter((a) => sameDay(parseBR(a.agenda), d));
            const isToday = sameDay(d, today);
            const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
            return (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: isToday ? T.accent + "15" : "#0d0d0d", border: `1px solid ${isToday ? T.accent + "44" : T.border}` }}>
                <div style={{ minWidth: 44, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: isToday ? T.accent : T.dim, fontWeight: 700, textTransform: "uppercase" }}>{dayNames[i]}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: isToday ? T.accent : T.text, lineHeight: 1 }}>{d.getDate().toString().padStart(2, "0")}</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  {clientes.length === 0 ? (
                    <span style={{ fontSize: 11, color: T.dim, fontStyle: "italic", paddingTop: 8 }}>Sem agendamentos</span>
                  ) : (
                    clientes.map((c) => (
                      <div key={c.id} style={{ padding: "5px 10px", borderRadius: 6, background: TS[c.temp].bg + "33", fontSize: 11, fontWeight: 600, color: TS[c.temp].fg === "#fff" ? TS[c.temp].bg : T.text, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: TS[c.temp].bg }} />
                        {c.cliente}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <BigCard title="Previsão de Vendas" value={Math.round(tO / 3)} sub="Orçamento / 3" gradient="linear-gradient(135deg,#efa000,#c98500)" />
        <BigCard title="Total Orçado" value={tO} sub="Soma orçamentos" gradient="linear-gradient(135deg,#c98500,#a06b00)" />
        <BigCard title="Total Vendido" value={tV} sub="Soma vendas" gradient="linear-gradient(135deg,#6fcf97,#3da366)" />
        <BigCard title="Total Perdidos" value={tP} sub="Soma perdas" gradient="linear-gradient(135deg,#e05c5c,#b03a3a)" />
      </div>
    </div>
  </>);
}

/* ═══ PÓS-VENDA ═══ */
function PVPage() {
  const [data, setData] = useState(initPV); const [sel, setSel] = useState(null); const fr = useRef(null); const [uid, setUid] = useState(null);
  const [df, setDf] = useState(""); const [dt, setDt] = useState("");
  const [fornecedores, setFornecedores] = useState([
    { id: 1, nome: "Marcenaria Silva", tel: "(11) 3456-7890", email: "contato@silva.com", seg: "Marcenaria" },
    { id: 2, nome: "Mármores Premium", tel: "(11) 4567-8901", email: "vendas@marmores.com", seg: "Pedras" },
    { id: 3, nome: "IlumiTech", tel: "(21) 5678-9012", email: "proj@ilumi.tech", seg: "Iluminação" },
  ]);
  const [sfm, setSfm] = useState(false);
  const [ff, setFf] = useState({ nome: "", tel: "", email: "", seg: "" });
  const [calSel, setCalSel] = useState(null); // selected client in calendar
  const s = data.find((p) => p.id === sel);
  const addF = () => { if (!ff.nome) return; setFornecedores([...fornecedores, { id: Date.now(), ...ff }]); setFf({ nome: "", tel: "", email: "", seg: "" }); setSfm(false); };

  // Calendar: current month
  const today = new Date("2026-04-22");
  const year = today.getFullYear(), month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const getClientOnDate = (day) => {
    const d = new Date(year, month, day);
    return data.filter((p) => {
      const start = new Date(p.start), end = new Date(p.end);
      return d >= start && d <= end;
    });
  };

  const calClient = data.find((p) => p.id === calSel);

  return (<>
    <input ref={fr} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f && uid) setData((p) => p.map((x) => (x.id === uid ? { ...x, pdf: f.name } : x))); setUid(null); e.target.value = ""; }} />
    {sfm && <Modal onClose={() => setSfm(false)}><h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: "#d4784a" }}>Cadastrar Fornecedor</h3><div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{[{ l: "Nome da loja", k: "nome" }, { l: "Telefone", k: "tel" }, { l: "E-mail", k: "email" }, { l: "Segmento", k: "seg" }].map((f) => <div key={f.k}><label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>{f.l}</label><input value={ff[f.k]} onChange={(e) => setFf({ ...ff, [f.k]: e.target.value })} style={inp} placeholder={f.l} /></div>)}<div style={{ display: "flex", gap: 10 }}><button onClick={addF} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", background: "#d4784a", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: T.font }}>Cadastrar</button><button onClick={() => setSfm(false)} style={{ padding: "12px 20px", borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer", background: "transparent", color: T.muted, fontSize: 13, fontFamily: T.font }}>Cancelar</button></div></div></Modal>}

    <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
      <DateFilter from={df} to={dt} setFrom={setDf} setTo={setDt} />
      <div style={{ flex: 1 }} />
      <button onClick={() => setSfm(true)} style={{ padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", background: "#d4784a", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: T.font }}>+ Cadastrar Fornecedor</button>
      <button style={{ padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: T.bg, fontSize: 13, fontWeight: 700, fontFamily: T.font }}>Emitir Relatório</button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 28 }}><KPI label="Obras ativas" value={data.filter((p) => p.prog < 100).length} accent={T.accent} /><KPI label="Entregues" value={data.filter((p) => p.prog === 100).length} accent={T.sold} /><KPI label="Valor contratos" value={data.reduce((s, p) => s + p.ctr, 0)} prefix="R$ " accent={T.accent} /><KPI label="Recebido" value={data.reduce((s, p) => s + p.rec, 0)} prefix="R$ " accent={T.sold} /><KPI label="A receber" value={data.reduce((s, p) => s + p.ar, 0)} prefix="R$ " accent={T.lost} /></div>

    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 24 }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}` }}><span style={{ fontSize: 14, fontWeight: 700 }}>Acompanhamento de Obras</span></div>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}><thead><tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d0d0d" }}>{["Cliente", "Empresa", "Etapa", "Progresso", "Orçamentos", "Contrato", "Recebido", "A Receber"].map((h) => <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
      <tbody>{data.map((p) => { const bc = p.prog === 100 ? T.sold : p.prog >= 60 ? T.accent : p.prog >= 30 ? T.lw : T.cold; return <tr key={p.id} onClick={() => setSel(sel === p.id ? null : p.id)} style={{ borderBottom: "1px solid #141414", cursor: "pointer", background: sel === p.id ? T.cardH : "transparent" }} onMouseEnter={(e) => { if (sel !== p.id) e.currentTarget.style.background = "#131313"; }} onMouseLeave={(e) => { if (sel !== p.id) e.currentTarget.style.background = "transparent"; }}><td style={{ padding: "12px 14px", fontWeight: 600 }}>{p.client}</td><td style={{ padding: "12px 14px", color: T.muted }}>{p.co}</td><td style={{ padding: "12px 14px" }}><span style={{ padding: "4px 12px", borderRadius: 8, background: bc + "22", color: bc, fontSize: 11, fontWeight: 600 }}>{p.stage}</span></td><td style={{ padding: "12px 14px", width: "16%" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 10, borderRadius: 5, background: "#1a1a1a", overflow: "hidden" }}><div style={{ width: `${p.prog}%`, height: "100%", borderRadius: 5, background: bc }} /></div><span style={{ fontSize: 12, fontWeight: 700, color: bc }}>{p.prog}%</span></div></td><td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>{p.pdf ? <span style={{ fontSize: 11, color: T.sold }}>📄 {p.pdf}</span> : <button onClick={() => { setUid(p.id); fr.current?.click(); }} style={{ padding: "5px 12px", borderRadius: 6, border: `1px dashed ${T.dim}`, cursor: "pointer", background: "transparent", color: T.dim, fontSize: 11, fontFamily: T.font }}>📎 Anexar</button>}</td><td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>R$ {p.ctr.toLocaleString("pt-BR")}</td><td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: T.sold }}>R$ {p.rec.toLocaleString("pt-BR")}</td><td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: T.lost }}>R$ {p.ar.toLocaleString("pt-BR")}</td></tr>; })}</tbody></table></div>
    </div>
    {s && <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 24, marginBottom: 24 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><div><h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{s.client}</h3><span style={{ fontSize: 13, color: T.muted }}>{s.co}</span></div><button onClick={() => setSel(null)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: T.font }}>✕</button></div><div style={{ display: "flex", gap: 4, overflowX: "auto" }}>{PVS.map((st, i) => { const done = i <= s.si, cur = i === s.si; return <div key={st} style={{ flex: "1 1 0", minWidth: 82, textAlign: "center", padding: "12px 4px", borderRadius: 10, background: cur ? T.accent + "22" : done ? "#162e1c" : "#141414", border: `1px solid ${cur ? T.accent : done ? T.sold + "44" : T.border}` }}><div style={{ fontSize: 16, marginBottom: 4 }}>{done ? "✓" : i + 1}</div><div style={{ fontSize: 9, fontWeight: 600, color: cur ? T.accent : done ? T.sold : T.dim }}>{st}</div></div>; })}</div></div>}

    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 24 }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}` }}><span style={{ fontSize: 14, fontWeight: 700 }}>Fornecedores</span></div>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d0d0d" }}>{["Nome da Loja", "Telefone", "E-mail", "Segmento"].map((h) => <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
      <tbody>{fornecedores.map((f) => <tr key={f.id} style={{ borderBottom: "1px solid #141414" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#131313"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}><td style={{ padding: "12px 16px", fontWeight: 600 }}>{f.nome}</td><td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: T.muted }}>{f.tel}</td><td style={{ padding: "12px 16px", color: T.muted, fontSize: 12 }}>{f.email}</td><td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 12px", borderRadius: 6, background: "#1e2a3a", color: T.blue, fontSize: 11, fontWeight: 600 }}>{f.seg}</span></td></tr>)}</tbody></table></div>
    </div>

    {/* Calendário de Obras */}
    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>📅 Calendário de Obras</span>
        <span style={{ fontSize: 13, color: T.accent, fontWeight: 700, textTransform: "capitalize" }}>{monthName}</span>
      </div>
      <div style={{ padding: 20 }}>
        {/* Week header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, color: T.dim, fontWeight: 700, textTransform: "uppercase", padding: 6 }}>{d}</div>
          ))}
        </div>
        {/* Days grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {Array(firstDay).fill(null).map((_, i) => <div key={"e" + i} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const clients = getClientOnDate(day);
            const isToday = day === today.getDate();
            return (
              <div key={day} style={{ minHeight: 70, padding: 6, borderRadius: 8, background: isToday ? T.accent + "15" : "#0d0d0d", border: `1px solid ${isToday ? T.accent + "66" : T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? T.accent : T.muted, marginBottom: 4 }}>{day}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {clients.slice(0, 3).map((c) => {
                    const bc = c.prog === 100 ? T.sold : c.prog >= 60 ? T.accent : c.prog >= 30 ? T.lw : T.cold;
                    return (
                      <div key={c.id} onClick={() => setCalSel(c.id)} style={{ padding: "2px 6px", borderRadius: 4, background: bc + "22", color: bc, fontSize: 9, fontWeight: 600, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "background .2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = bc + "44"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = bc + "22"; }}>
                        {c.client}
                      </div>
                    );
                  })}
                  {clients.length > 3 && <div style={{ fontSize: 9, color: T.dim, paddingLeft: 6 }}>+{clients.length - 3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client detail dashboard */}
      {calClient && (() => {
        const bc = calClient.prog === 100 ? T.sold : calClient.prog >= 60 ? T.accent : calClient.prog >= 30 ? T.lw : T.cold;
        const dias = Math.ceil((new Date(calClient.end) - new Date(calClient.start)) / (1000 * 60 * 60 * 24));
        const diasPassed = Math.ceil((today - new Date(calClient.start)) / (1000 * 60 * 60 * 24));
        const diasRest = Math.max(0, dias - diasPassed);
        return (
          <div style={{ borderTop: `1px solid ${T.border}`, padding: 24, background: "#0d0d0d", animation: "fadeIn .3s ease" }}>
            <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 4 }}>Obra selecionada</div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>{calClient.client}</h3>
                <span style={{ fontSize: 13, color: T.muted }}>{calClient.co}</span>
              </div>
              <button onClick={() => setCalSel(null)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: T.font }}>✕ Fechar</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
              <div style={{ background: T.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${bc}44` }}>
                <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Etapa atual</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: bc }}>{calClient.stage}</div>
              </div>
              <div style={{ background: T.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Progresso</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: bc }}>{calClient.prog}%</div>
                <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "#1a1a1a" }}><div style={{ width: `${calClient.prog}%`, height: "100%", borderRadius: 2, background: bc }} /></div>
              </div>
              <div style={{ background: T.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Dias restantes</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.accent }}>{diasRest}</div>
                <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{diasPassed} / {dias} dias</div>
              </div>
              <div style={{ background: T.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Contrato</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>R$ {calClient.ctr.toLocaleString("pt-BR")}</div>
              </div>
              <div style={{ background: T.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${T.sold}44` }}>
                <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Recebido</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.sold }}>R$ {calClient.rec.toLocaleString("pt-BR")}</div>
              </div>
              <div style={{ background: T.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${T.lost}44` }}>
                <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>A receber</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.lost }}>R$ {calClient.ar.toLocaleString("pt-BR")}</div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ background: T.card, borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Timeline de Etapas</div>
              <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
                {PVS.map((st, i) => {
                  const done = i <= calClient.si, cur = i === calClient.si;
                  return (
                    <div key={st} style={{ flex: "1 1 0", minWidth: 82, textAlign: "center", padding: "12px 4px", borderRadius: 10, background: cur ? T.accent + "22" : done ? "#162e1c" : "#141414", border: `1px solid ${cur ? T.accent : done ? T.sold + "44" : T.border}` }}>
                      <div style={{ fontSize: 16, marginBottom: 4 }}>{done ? "✓" : i + 1}</div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: cur ? T.accent : done ? T.sold : T.dim }}>{st}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  </>);
}

/* ═══ FINANCEIRO ═══ */
function FinPage() {
  const [lanc, setLanc] = useState(initLanc); const [df, setDf] = useState(""); const [dt, setDt] = useState("");
  const [scf, setScf] = useState(false); const [cf, setCf] = useState({ data: "", desc: "", tipo: "D", v: "" });
  const tR = lanc.filter((l) => l.tipo === "R").reduce((s, l) => s + l.v, 0), tD = lanc.filter((l) => l.tipo === "D").reduce((s, l) => s + l.v, 0), mg = tR - tD, mp = tR > 0 ? ((mg / tR) * 100).toFixed(1) : "0";
  const addC = () => { if (!cf.desc) return; setLanc([...lanc, { id: Date.now(), data: cf.data, desc: cf.desc, tipo: cf.tipo, v: parseFloat(cf.v) || 0 }]); setCf({ data: "", desc: "", tipo: "D", v: "" }); setScf(false); };

  return (<>
    {scf && <Modal onClose={() => setScf(false)}><h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: T.accent }}>Criar Custo</h3><div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{[{ l: "Data", k: "data", ph: "dd/mm" }, { l: "Descrição", k: "desc", ph: "Descrição do custo" }, { l: "Valor (R$)", k: "v", ph: "0,00" }].map((f) => <div key={f.k}><label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>{f.l}</label><input value={cf[f.k]} onChange={(e) => setCf({ ...cf, [f.k]: e.target.value })} style={inp} placeholder={f.ph} /></div>)}<div><label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>Tipo</label><div style={{ display: "flex", gap: 8 }}>{[{ l: "Despesa", v: "D" }, { l: "Receita", v: "R" }].map((t) => <button key={t.v} onClick={() => setCf({ ...cf, tipo: t.v })} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: cf.tipo === t.v ? (t.v === "R" ? T.sold : T.lost) : "#1a1a1a", color: cf.tipo === t.v ? "#fff" : T.dim, fontSize: 13, fontWeight: 600, fontFamily: T.font }}>{t.l}</button>)}</div></div><div style={{ display: "flex", gap: 10 }}><button onClick={addC} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: T.bg, fontSize: 14, fontWeight: 700, fontFamily: T.font }}>Salvar</button><button onClick={() => setScf(false)} style={{ padding: "12px 20px", borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer", background: "transparent", color: T.muted, fontSize: 13, fontFamily: T.font }}>Cancelar</button></div></div></Modal>}

    <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
      <DateFilter from={df} to={dt} setFrom={setDf} setTo={setDt} />
      <div style={{ flex: 1 }} />
      <button style={{ padding: "10px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: T.bg, fontSize: 13, fontWeight: 700, fontFamily: T.font }}>Gerar Boletos</button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}><KPI label="Receita total" value={tR} prefix="R$ " accent={T.sold} /><KPI label="Despesas totais" value={tD} prefix="R$ " accent={T.lost} /><KPI label="Margem líquida" value={mg} prefix="R$ " accent={mg >= 0 ? T.sold : T.lost} /><KPI label="% Margem" value={parseFloat(mp)} suffix="%" decimals={1} accent={T.accent} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 24 }}>
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 22 }}><h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Metas vs Realizado — 2026</h3><BarChart data={metasData} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}><div style={{ borderRadius: 16, padding: "28px 24px", flex: 1, color: "#fff", background: mg >= 0 ? "linear-gradient(135deg,#6fcf97,#3da366)" : "linear-gradient(135deg,#e05c5c,#b03a3a)" }}><div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 6 }}>Margem Líquida</div><div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1 }}><AnimNum target={mg} prefix="R$ " /></div><div style={{ fontSize: 12, marginTop: 10, opacity: 0.75 }}>{mp}% sobre a receita</div></div><div style={{ borderRadius: 16, padding: "22px 24px", background: "linear-gradient(135deg,#efa000,#c98500)", color: "#fff" }}><div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 4 }}>Receita</div><div style={{ fontSize: 30, fontWeight: 800 }}><AnimNum target={tR} prefix="R$ " /></div></div><div style={{ borderRadius: 16, padding: "22px 24px", background: "linear-gradient(135deg,#e05c5c,#b03a3a)", color: "#fff" }}><div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 4 }}>Despesas</div><div style={{ fontSize: 30, fontWeight: 800 }}><AnimNum target={tD} prefix="R$ " /></div></div></div>
    </div>
    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}` }}><span style={{ fontSize: 14, fontWeight: 700 }}>Lançamentos — Abril 2026</span></div>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d0d0d" }}>{["Data", "Descrição", "Tipo", "Valor"].map((h) => <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
      <tbody>{lanc.map((l) => <tr key={l.id} style={{ borderBottom: "1px solid #141414" }} onMouseEnter={(e) => { e.currentTarget.style.background = T.cardH; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}><td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: 12, color: T.muted }}>{l.data}</td><td style={{ padding: "12px 18px", fontWeight: 500 }}>{l.desc}</td><td style={{ padding: "12px 18px" }}><span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: l.tipo === "R" ? "#162e1c" : "#2e1616", color: l.tipo === "R" ? T.sold : T.lost }}>{l.tipo === "R" ? "Receita" : "Despesa"}</span></td><td style={{ padding: "12px 18px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: l.tipo === "R" ? T.sold : T.lost }}>{l.tipo === "R" ? "+" : "-"} R$ {l.v.toLocaleString("pt-BR")}</td></tr>)}</tbody></table></div>
      <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.border}` }}>
        <button onClick={() => setScf(true)} style={{ padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: T.bg, fontSize: 13, fontWeight: 700, fontFamily: T.font }}>+ Criar Custo</button>
      </div>
    </div>
  </>);
}

/* ═══ PARCEIROS ═══ */
function ParPage() {
  const [pts, setPts] = useState(initPartners); const [sf, setSf] = useState(false); const [fm, setFm] = useState({ nome: "", email: "", tel: "", insta: "", aniv: "" });
  const [es, setEs] = useState(null); const [ee, setEe] = useState(null);
  const ranked = [...pts].sort((a, b) => b.total - a.total);
  const add = () => { if (!fm.nome) return; setPts([...pts, { id: Date.now(), nome: fm.nome.toUpperCase(), email: fm.email, tel: fm.tel, insta: fm.insta, aniv: fm.aniv, ult: new Date().toLocaleDateString("pt-BR"), status: "Contato", total: 0, evento: "Convidado" }]); setFm({ nome: "", email: "", tel: "", insta: "", aniv: "" }); setSf(false); };

  return (<>
    {sf && <Modal onClose={() => setSf(false)}>
      <h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: T.purple }}>Cadastrar Parceiro</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { l: "Nome", k: "nome" },
          { l: "E-mail", k: "email" },
          { l: "Telefone", k: "tel" },
          { l: "@ do Instagram", k: "insta", ph: "@seuusuario" },
          { l: "Aniversário", k: "aniv", ph: "dd/mm" },
        ].map((f) => (
          <div key={f.k}>
            <label style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 5 }}>{f.l}</label>
            <input value={fm[f.k]} onChange={(e) => setFm({ ...fm, [f.k]: e.target.value })} style={inp} placeholder={f.ph || f.l} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={add} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", background: T.purple, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: T.font }}>Cadastrar</button>
          <button onClick={() => setSf(false)} style={{ padding: "12px 20px", borderRadius: 10, border: `1px solid ${T.border}`, cursor: "pointer", background: "transparent", color: T.muted, fontSize: 13, fontFamily: T.font }}>Cancelar</button>
        </div>
      </div>
    </Modal>}
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}><button onClick={() => setSf(true)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: T.purple, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: T.font }}>+ Cadastrar Parceiro</button></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}><KPI label="Total parceiros" value={pts.length} accent={T.purple} /><KPI label="Parceiros Black" value={pts.filter((p) => p.status === "Black").length} accent="#333" /><KPI label="Volume total" value={pts.reduce((s, p) => s + p.total, 0)} prefix="R$ " accent={T.accent} /></div>
    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 28 }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}` }}><span style={{ fontSize: 14, fontWeight: 700 }}>Parceiros</span></div>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1000 }}><thead><tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d0d0d" }}>{["Nome", "E-mail", "Telefone", "Instagram", "Aniversário", "Últ. Contato", "Status", "Evento"].map((h) => <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
      <tbody>{pts.map((p) => { const ps = PSS[p.status] || { bg: "#222", fg: "#aaa" }; const ev = EVT_S[p.evento] || { bg: "#222", fg: "#aaa" }; return <tr key={p.id} style={{ borderBottom: "1px solid #141414" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#131313"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
        <td style={{ padding: "12px 14px", fontWeight: 600 }}>{p.nome}</td>
        <td style={{ padding: "12px 14px", color: T.muted, fontSize: 12 }}>{p.email}</td>
        <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: T.muted }}>{p.tel}</td>
        <td style={{ padding: "12px 14px", fontSize: 12 }}>
          {p.insta ? (
            <a href={`https://instagram.com/${p.insta.replace("@", "")}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#E4405F", textDecoration: "none", fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              {p.insta}
            </a>
          ) : <span style={{ color: T.dim }}>—</span>}
        </td>
        <td style={{ padding: "12px 14px", fontSize: 12, color: T.muted }}>{p.aniv}</td>
        <td style={{ padding: "12px 14px", fontSize: 12, color: T.muted }}>{p.ult}</td>
        <td style={{ padding: "12px 14px", position: "relative" }}><span onClick={() => setEs(es === p.id ? null : p.id)} style={{ padding: "4px 14px", borderRadius: 6, background: ps.bg, color: ps.fg, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{p.status} ▾</span>{es === p.id && <div style={{ position: "absolute", top: "100%", left: 4, zIndex: 50, background: "#1a1a1a", border: `1px solid ${T.border}`, borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 3, boxShadow: "0 12px 40px rgba(0,0,0,.6)" }}>{PS_LIST.map((s) => { const ss = PSS[s] || { bg: "#222", fg: "#aaa" }; return <button key={s} onClick={() => { setPts(pts.map((x) => (x.id === p.id ? { ...x, status: s } : x))); setEs(null); }} style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: ss.bg, color: ss.fg, fontSize: 11, fontWeight: 600, textAlign: "left", fontFamily: T.font }}>{s}</button>; })}</div>}</td>
        <td style={{ padding: "12px 14px", position: "relative" }}><span onClick={() => setEe(ee === p.id ? null : p.id)} style={{ padding: "4px 14px", borderRadius: 6, background: ev.bg, color: ev.fg, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{p.evento} ▾</span>{ee === p.id && <div style={{ position: "absolute", top: "100%", left: 4, zIndex: 50, background: "#1a1a1a", border: `1px solid ${T.border}`, borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 3, boxShadow: "0 12px 40px rgba(0,0,0,.6)" }}>{EVT_LIST.map((ev2) => { const es2 = EVT_S[ev2] || { bg: "#222", fg: "#aaa" }; return <button key={ev2} onClick={() => { setPts(pts.map((x) => (x.id === p.id ? { ...x, evento: ev2 } : x))); setEe(null); }} style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: es2.bg, color: es2.fg, fontSize: 11, fontWeight: 600, textAlign: "left", fontFamily: T.font }}>{ev2}</button>; })}</div>}</td>
      </tr>; })}</tbody></table></div>
    </div>
    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}` }}><span style={{ fontSize: 14, fontWeight: 700 }}>Ranking — Mais Compraram</span></div>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d0d0d" }}>{["#", "Parceiro", "Total em Compras", "Status"].map((h) => <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
      <tbody>{ranked.map((p, i) => { const ps = PSS[p.status] || { bg: "#222", fg: "#aaa" }; const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""; return <tr key={p.id} style={{ borderBottom: "1px solid #141414" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#131313"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}><td style={{ padding: "12px 18px", fontSize: 16, width: 50 }}>{medal || i + 1}</td><td style={{ padding: "12px 18px", fontWeight: 600 }}>{p.nome}</td><td style={{ padding: "12px 18px" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ flex: 1, maxWidth: 200, height: 8, borderRadius: 4, background: "#1a1a1a", overflow: "hidden" }}><div style={{ width: `${ranked[0].total > 0 ? (p.total / ranked[0].total) * 100 : 0}%`, height: "100%", borderRadius: 4, background: i === 0 ? T.accent : i === 1 ? T.lw : i === 2 ? "#d4784a" : T.dim }} /></div><span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: i < 3 ? T.accent : T.muted }}>R$ {p.total.toLocaleString("pt-BR")}</span></div></td><td style={{ padding: "12px 18px" }}><span style={{ padding: "4px 12px", borderRadius: 6, background: ps.bg, color: ps.fg, fontSize: 11, fontWeight: 600 }}>{p.status}</span></td></tr>; })}</tbody></table></div>
    </div>
  </>);
}

/* ═══ APP ═══ */
export default function App() {
  const [pg, setPg] = useState("home"); const [fi, setFi] = useState(false);
  useEffect(() => { setFi(false); setTimeout(() => setFi(true), 50); }, [pg]);
  if (pg === "home") return <HomePage go={setPg} />;
  const nav = [{ k: "camp", l: "Campanhas", i: "◎" }, { k: "crm", l: "CRM", i: "◉" }, { k: "pv", l: "Pós-Venda", i: "◈" }, { k: "fin", l: "Financeiro", i: "◇" }, { k: "par", l: "Parceiros", i: "◆" }];
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.font }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <header style={{ padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.88)", backdropFilter: "blur(20px)" }}>
        <MiaLogo size={36} onClick={() => setPg("home")} animated />
        <nav style={{ display: "flex", gap: 3, background: T.card, borderRadius: 10, padding: 3, border: `1px solid ${T.border}` }}>{nav.map((t) => <button key={t.k} onClick={() => setPg(t.k)} style={{ padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all .25s", fontFamily: T.font, background: pg === t.k ? T.accent : "transparent", color: pg === t.k ? T.bg : T.muted }}>{t.i} {t.l}</button>)}</nav>
        <UserMenu />
      </header>
      <main style={{ padding: "24px 28px", maxWidth: 1440, margin: "0 auto", opacity: fi ? 1 : 0, transform: fi ? "translateY(0)" : "translateY(8px)", transition: "opacity .4s,transform .4s" }}>
        {pg === "camp" && <CampPage />}
        {pg === "crm" && <CRMPage />}
        {pg === "pv" && <PVPage />}
        {pg === "fin" && <FinPage />}
        {pg === "par" && <ParPage />}
      </main>
      <footer style={{ padding: "18px 28px", borderTop: "1px solid #131313", display: "flex", justifyContent: "space-between", marginTop: 32 }}><span style={{ fontSize: 10, color: "#333" }}>© 2026 mia · Powered by Orbe</span><span style={{ fontSize: 10, color: "#333" }}>Dados em tempo real</span></footer>
    </div>
  );
}
