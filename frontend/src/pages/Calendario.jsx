// src/pages/Calendario.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topo from '../components/Topo';

// Paleta
const GREEN = '#2d6a4f';
const GREEN_DARK = '#1b4332';
const GREEN_DONE_BORDER = '#2E7D32';
const ORANGE = '#f59f00';
const RED_BG = '#fde2e2';
const RED_BORDER = '#e03131';
const LIGHT = '#ecf4ef';

// Estados do dia (acessíveis)
const TODAY_BG = '#E3F2FD';          // azul claro para HOJE pendente
const TODAY_TEXT = '#0D47A1';        // azul escuro para o número de HOJE
const TODAY_DONE_BG = '#C8E6C9';     // verde mais forte para HOJE FEITO
const DONE_BG = '#E8F5E9';           // dia feito (não hoje)

function pad2(n) { return n.toString().padStart(2, '0'); }
function iso(d) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return `${x.getFullYear()}-${pad2(x.getMonth()+1)}-${pad2(x.getDate())}`;
}
function monthLabel(y, mIndex) {
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${meses[mIndex]} ${y}`;
}
function buildGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const firstWeekday = (first.getDay() + 7) % 7; // 0=Dom
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = [];
  for (let i=0;i<firstWeekday;i++) days.push(null);
  for (let d=1; d<=daysInMonth; d++) days.push(new Date(year, monthIndex, d));
  while (days.length % 7 !== 0) days.push(null);
  while (days.length < 42) days.push(null);
  return days;
}

export default function Calendario() {
  const navigate = useNavigate();
  const API_BASE = useMemo(() => process.env.REACT_APP_API_BASE || 'http://localhost:5000', []);
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const today = useMemo(() => { const t=new Date(); t.setHours(0,0,0,0); return t; }, []);

  const [menuAberto, setMenuAberto] = useState(false); // topo com menu lateral
  const [cursor, setCursor] = useState(() => { const d=new Date(); return { y:d.getFullYear(), mIndex:d.getMonth() }; });
  const [map, setMap] = useState({}); // { 'YYYY-MM-DD': {status, items:[{id_favorito,done,...}] } }
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [selected, setSelected] = useState(null); // 'YYYY-MM-DD'

  // filtro por favorito (abas)
  const [favFilter, setFavFilter] = useState(null); // number | null

  const grid = useMemo(() => buildGrid(cursor.y, cursor.mIndex), [cursor]);

  useEffect(() => {
    if (!user?.id) return;
    const y = cursor.y;
    const m = cursor.mIndex + 1;

    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/avisos/${user.id}?year=${y}&month=${m}`)
      .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => setMap(data.days || {}))
      .catch(e => { console.error(e); setError('Não foi possível carregar os avisos deste mês.'); setMap({}); })
      .finally(() => setLoading(false));
  }, [API_BASE, cursor, user?.id]);

  const goPrev = () => {
    let y = cursor.y; let m = cursor.mIndex - 1;
    if (m < 0) { m = 11; y -= 1; }
    setCursor({ y, mIndex: m });
    if (selected) {
      const [yy, mm] = selected.split('-').map(Number);
      if (!(yy === y && mm === m + 1)) setSelected(`${y}-${String(m+1).padStart(2,'0')}-01`);
    }
  };
  const goNext = () => {
    let y = cursor.y; let m = cursor.mIndex + 1;
    if (m > 11) { m = 0; y += 1; }
    setCursor({ y, mIndex: m });
    if (selected) {
      const [yy, mm] = selected.split('-').map(Number);
      if (!(yy === y && mm === m + 1)) setSelected(`${y}-${String(m+1).padStart(2,'0')}-01`);
    }
  };

  // Lista única de favoritos (abas)
  const favoritosList = useMemo(() => {
    const byId = new Map(); // id_favorito -> { id, nome }
    for (const k in map) {
      for (const it of map[k]?.items ?? []) {
        if (!byId.has(it.id_favorito)) {
          byId.set(it.id_favorito, { id: it.id_favorito, nome: it.nomePlanta });
        }
      }
    }
    return Array.from(byId.values()).sort((a,b) =>
      String(a.nome).localeCompare(String(b.nome))
    );
  }, [map]);

  // Mapa filtrado por favorito selecionado
  const mapFiltered = useMemo(() => {
    if (!favFilter) return map;
    const out = {};
    for (const k in map) {
      const entry = map[k];
      if (!entry) continue;
      const items = entry.items.filter(it => it.id_favorito === favFilter);
      if (items.length) {
        // status baseado na data k
        const d = new Date(k); d.setHours(0,0,0,0);
        const s = d < today ? 'overdue' : (d.getTime() === today.getTime() ? 'due' : 'upcoming');
        out[k] = { status: s, items };
      }
    }
    return out;
  }, [map, favFilter, today]);

  // Agrupa items do dia selecionado por id_favorito -> 1 bloco por favorito
  const groupedByFavorito = useMemo(() => {
    const source = mapFiltered;
    const arr = selected ? (source[selected]?.items || []) : [];
    const g = new Map();
    for (const it of arr) {
      if (!g.has(it.id_favorito)) g.set(it.id_favorito, []);
      g.get(it.id_favorito).push(it);
    }
    return g;
  }, [selected, mapFiltered]);

  // Toggle da atividade realizada (POST / DELETE)
  async function toggleDone(idFavorito, dia, currentDone) {
    const url = `${API_BASE}/api/avisos/realizar`;
    try {
      let ok = false;
      if (!currentDone) {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idUsuario: user.id, idFavorito, data: dia })
        });
        ok = r.ok;
      } else {
        const r = await fetch(`${url}?idUsuario=${user.id}&idFavorito=${idFavorito}&data=${dia}`, {
          method: 'DELETE'
        });
        ok = r.ok;
      }
      if (!ok) throw new Error('Falha ao salvar');
      // Atualiza estado localmente sem refazer fetch
      setMap(prev => {
        const clone = { ...prev };
        const day = clone[dia];
        if (!day) return clone;
        day.items = day.items.map(it => {
          if (it.id_favorito === idFavorito) return { ...it, done: !currentDone };
          return it;
        });
        clone[dia] = { ...day };
        return clone;
      });
    } catch (e) {
      console.error(e);
      alert('Não foi possível salvar. Tente novamente.');
    }
  }

  const selectedStr = selected ? selected.split('-').reverse().join('/') : '';

  // ====== ESTILOS DO TOPO (iguais ao Conteudo) ======
  const topStyles = {
    wrapper: { backgroundColor: '#f3f6f4', minHeight: '100vh' },
    topBar: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: 'none',
      borderTop: 'none',
    },
    menuLateral: {
      position: 'fixed',
      top: '60px',
      right: '20px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
    },
  };
  // ===================================================

  return (
    <div style={topStyles.wrapper}>
      {/* TOPO padronizado */}
      <div style={topStyles.topBar}>
        <Topo centralizado comMenu onMenuClick={() => setMenuAberto(v => !v)} />
        {menuAberto && (
          <div style={topStyles.menuLateral}>
            <button
              onClick={() => { localStorage.clear(); navigate('/'); }}
              style={{
                padding: '10px 14px',
                background: '#d62828', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer'
              }}
            >
              Sair
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1120, margin: '20px auto', padding: '10px' }}>
        <h2 style={{ color: GREEN, margin: '10px 0 18px 0' }}>📅 Calendário de Avisos</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .9fr', gap: 20 }}>
          {/* CALENDÁRIO */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,.06)', padding: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 6px 16px' }}>
              <button aria-label="Mês anterior" onClick={goPrev} style={btnNav}>{'‹'}</button>
              <div style={{ fontWeight: 700, color: '#264653' }}>{monthLabel(cursor.y, cursor.mIndex)}</div>
              <button aria-label="Próximo mês" onClick={goNext} style={btnNav}>{'›'}</button>
            </div>

            {/* Week header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, padding: '0 6px', color: '#7a8a80', fontSize: 13 }}>
              {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => <div key={d} style={{ textAlign: 'center' }}>{d}</div>)}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginTop: 10 }}>
              {grid.map((d, i) => {
                if (!d) return <div key={i} style={{ height: 68 }} />;
                const k = iso(d);
                const entry = mapFiltered[k];
                const isTodayCell = k === iso(today);
                const isSelectedCell = k === selected;

                // “dia feito” = todos os items do dia estão done
                const dayDone = !!entry && entry.items.length > 0 && entry.items.every(it => it.done);

                let bg = '#f5fbf7';
                let border = '1px solid #e7efe9';
                let dot = false;
                let dayNumberColor = '#264653';

                if (entry) {
                  if (dayDone) {
                    bg = isTodayCell ? TODAY_DONE_BG : DONE_BG;
                    border = `2px solid ${GREEN_DONE_BORDER}`;
                    dot = false;
                    dayNumberColor = GREEN_DARK;
                  } else if (entry.status === 'overdue') {
                    bg = RED_BG;
                    border = `1px solid ${RED_BORDER}`;
                    dayNumberColor = '#7a1b1b';
                  } else {
                    // tem aviso pendente
                    dot = true;
                    if (isTodayCell) {
                      bg = TODAY_BG;
                      border = `2px solid ${GREEN}`;
                      dayNumberColor = TODAY_TEXT;
                    } else {
                      bg = '#ffffff';
                      border = '1px solid #e1e6e1';
                    }
                  }
                } else if (isTodayCell) {
                  bg = TODAY_BG;
                  border = `2px solid ${GREEN}`;
                  dayNumberColor = TODAY_TEXT;
                }

                // Selecionado: só anel (não troca as cores de estado)
                const ring = isSelectedCell
                  ? '0 0 0 3px rgba(45,106,79,0.28), 0 2px 8px rgba(0,0,0,.08)'
                  : 'none';

                const baseLabel = `${d.getDate()} de ${monthLabel(cursor.y, cursor.mIndex)}`;
                const label =
                  entry
                    ? (dayDone
                        ? `${baseLabel}: todas as atividades feitas`
                        : `${baseLabel}: ${entry.items.length} aviso(s), status ${entry.status}`)
                    : baseLabel;

                return (
                  <button
                    key={i}
                    style={{
                      height: 68, background: bg, border, borderRadius: 12,
                      position: 'relative', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer',
                      boxShadow: ring, outline: 'none'
                    }}
                    onClick={() => setSelected(k)}
                    title={label}
                    aria-label={label}
                  >
                    <span style={{ color: dayNumberColor, fontWeight: 700 }}>{d.getDate()}</span>
                    {dot && (
                      <span style={{
                        position: 'absolute', top: 6, right: 8,
                        width: 6, height: 6, borderRadius: '50%', background: ORANGE
                      }}/>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div style={{ marginTop: 18, background: '#fff', borderRadius: 12, border: '1px solid #eef2ee', padding: 14 }}>
              <div style={{ fontWeight: 700, color: '#445', marginBottom: 8 }}>Legenda</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                <li style={legendItem}><span style={{ ...legendSwatch, background: ORANGE }} />Dias com avisos (ponto laranja)</li>
                <li style={legendItem}><span style={{ ...legendSwatch, background: RED_BG, border: `1px solid ${RED_BORDER}` }} />Atrasado (dia em vermelho)</li>
                <li style={legendItem}><span style={{ ...legendSwatch, border: `2px solid ${GREEN_DONE_BORDER}`, background: DONE_BG }} />Dia feito (verde, sem ponto)</li>
                <li style={legendItem}><span style={{ ...legendSwatch, border: `2px solid ${GREEN}`, background: TODAY_BG }} />Hoje (cor especial)</li>
              </ul>
              {error && <div style={{ marginTop: 10, color: '#b00020', fontSize: 13 }}>{error}</div>}
            </div>
          </div>

          {/* PAINEL LATERAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* ABAS/FILTRO POR FAVORITO */}
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,.06)', padding: 12 }}>
              <div style={{ fontWeight: 700, color: '#445', marginBottom: 8 }}>Ver calendário de:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  onClick={() => { setFavFilter(null); setSelected(null); }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: favFilter === null ? `2px solid ${GREEN}` : '1px solid #e5ece7',
                    background: favFilter === null ? '#eaf5ef' : '#fff',
                    color: '#1b4332',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                  title="Mostrar todos os favoritos"
                >
                  Todos
                </button>

                {favoritosList.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setFavFilter(f.id); setSelected(null); }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 999,
                      border: favFilter === f.id ? `2px solid ${GREEN}` : '1px solid #e5ece7',
                      background: favFilter === f.id ? '#eaf5ef' : '#fff',
                      color: '#1b4332',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                    title={`Mostrar apenas ${f.nome}`}
                  >
                    {f.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Instrução */}
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,.06)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#445' }}>Selecione uma data</div>
              <div style={{ fontSize: 12, color: '#7b8', marginTop: 4 }}>Clique em um dia do calendário para ver os avisos</div>
            </div>

            {/* CARD VERDE */}
            <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #52b788 100%)', color: '#fff', borderRadius: 14, padding: 20, minHeight: 140 }}>
              {!selected ? (
                <div style={{ textAlign: 'center', opacity: .9 }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>🗓️</div>
                  Selecione um dia no calendário para visualizar os avisos
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                      Avisos de {selectedStr}
                    </div>
                    {loading && <span style={{ fontSize: 12, opacity: .9 }}>carregando…</span>}
                  </div>

                  {Array.from(groupedByFavorito.entries()).length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: 12, textAlign: 'center', color: '#fff' }}>
                      Nenhum aviso para este dia.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {Array.from(groupedByFavorito.entries()).map(([idFav, itens]) => {
                        const anyDone = itens.some(i => i.done);
                        const { nomePlanta, rega, intervaloDias } = itens[0];
                        return (
                          <div
                            key={idFav}
                            style={{
                              borderRadius: 12,
                              padding: 14,
                              background: anyDone
                                ? 'linear-gradient(135deg, #E8F5E9 0%, #D9F0DE 100%)'
                                : 'linear-gradient(135deg, #ffffff 0%, #f7fff9 100%)',
                              border: anyDone ? '1px solid #2b8a3e55' : '1px solid #ffffff66',
                              boxShadow: '0 6px 18px rgba(0,0,0,.18)',
                              color: '#0b2e1f'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <div>
                                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#0b2e1f' }}>
                                  {nomePlanta} {anyDone && <span aria-hidden>✅</span>}
                                </div>
                                <div style={{ fontSize: 12, marginTop: 2, color: '#1d4637' }}>
                                  Rega: {rega} (a cada {intervaloDias} {intervaloDias > 1 ? 'dias' : 'dia'})
                                </div>
                                {anyDone && <div style={{ fontSize: 12, marginTop: 6, color: '#1d4637' }}>Atividade marcada como realizada</div>}
                              </div>

                              <button
                                onClick={() => toggleDone(idFav, selected, anyDone)}
                                style={{
                                  borderRadius: 12,
                                  border: '1px solid #2b8a3e66',
                                  padding: '10px 14px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  background: anyDone ? '#E8F5E9' : '#ffffff',
                                  color: anyDone ? '#2b8a3e' : '#14532d',
                                  boxShadow: '0 2px 10px rgba(0,0,0,.18)'
                                }}
                                title={anyDone ? 'Desfazer (marcado como realizado)' : 'Marcar atividade feita'}
                              >
                                {anyDone ? 'Desfazer' : 'Atividade feita'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnNav = {
  width: 34,
  height: 34,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 9,
  background: LIGHT,
  border: '1px solid #dfe9e2',
  color: '#345',
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 700
};

const legendItem = { display: 'flex', alignItems: 'center', gap: 8, color: '#556' };
const legendSwatch = { width: 16, height: 16, borderRadius: 4, border: '1px solid #e6ece7', display: 'inline-block' };