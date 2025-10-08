import React, { useEffect, useMemo, useState } from 'react';
import Topo from '../components/Topo';

const GREEN = '#2d6a4f';
const ORANGE = '#f59f00';
const RED_BG = '#fde2e2';
const RED_BORDER = '#e03131';
const LIGHT = '#ecf4ef';

function pad2(n) {
  return n.toString().padStart(2, '0');
}
function iso(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
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
  // pre-padding
  for (let i = 0; i < firstWeekday; i++) days.push(null);
  // month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, monthIndex, d));
  }
  // pad to 6 rows x 7 cols
  while (days.length % 7 !== 0) days.push(null);
  while (days.length < 42) days.push(null);

  return days;
}

export default function Calendario() {
  const API_BASE = useMemo(() => process.env.REACT_APP_API_BASE || 'http://localhost:5000', []);
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const today = useMemo(() => {
    const t = new Date(); t.setHours(0,0,0,0); return t;
  }, []);

  const [cursor, setCursor] = useState(() => {
    const d = new Date(); return { y: d.getFullYear(), mIndex: d.getMonth() };
  });
  const [map, setMap] = useState({}); // { 'YYYY-MM-DD': {status, items:[] } }
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // 'YYYY-MM-DD'

  const grid = useMemo(() => buildGrid(cursor.y, cursor.mIndex), [cursor]);

  useEffect(() => {
    if (!user?.id) return;
    const y = cursor.y;
    const m = cursor.mIndex + 1;

    setLoading(true);
    fetch(`${API_BASE}/api/avisos/${user.id}?year=${y}&month=${m}`)
      .then(r => r.json())
      .then(data => setMap(data.days || {}))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [API_BASE, cursor, user?.id]);

  const goPrev = () => {
    let y = cursor.y; let m = cursor.mIndex - 1;
    if (m < 0) { m = 11; y -= 1; }
    setCursor({ y, mIndex: m }); setSelected(null);
  };
  const goNext = () => {
    let y = cursor.y; let m = cursor.mIndex + 1;
    if (m > 11) { m = 0; y += 1; }
    setCursor({ y, mIndex: m }); setSelected(null);
  };

  const selectedItems = selected ? (map[selected]?.items || []) : [];

  return (
    <div style={{ background: '#f3f6f4', minHeight: '100vh' }}>
      <Topo centralizado comMenu />

      <div style={{ maxWidth: 1120, margin: '20px auto', padding: '10px' }}>
        <h2 style={{ color: GREEN, margin: '10px 0 18px 0' }}>📅 Calendário de Avisos</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .9fr', gap: 20 }}>
          {/* CALENDÁRIO */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,.06)', padding: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 6px 16px' }}>
              <button onClick={goPrev} style={btnNav}>{'‹'}</button>
              <div style={{ fontWeight: 700, color: '#264653' }}>{monthLabel(cursor.y, cursor.mIndex)}</div>
              <button onClick={goNext} style={btnNav}>{'›'}</button>
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
                const entry = map[k];
                const isToday = k === iso(today);
                const isSelected = k === selected;

                let bg = '#f5fbf7';      // base
                let border = '1px solid #e7efe9';
                let dot = false;

                if (entry) {
                  // sinalização
                  if (entry.status === 'overdue') {
                    bg = RED_BG;
                    border = `1px solid ${RED_BORDER}`;
                  } else {
                    dot = true; // tem aviso (futuro ou hoje)
                    bg = '#fff8ee'; // leve alaranjado
                    border = '1px solid #f3e3cc';
                  }
                }

                if (isToday) {
                  border = `2px solid ${GREEN}`;
                }
                if (isSelected) {
                  border = `2px solid ${GREEN}`;
                  bg = '#eaf5ef';
                }

                return (
                  <button
                    key={i}
                    style={{
                      height: 68,
                      background: bg,
                      border,
                      borderRadius: 12,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelected(k)}
                    title={entry ? `${entry.items.length} aviso(s)` : ''}
                  >
                    <span style={{ color: '#264653', fontWeight: 600 }}>{d.getDate()}</span>
                    {/* dot laranja */}
                    {dot && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 8,
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: ORANGE
                        }}
                      />
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
                <li style={legendItem}><span style={{ ...legendSwatch, border: `2px solid ${GREEN}`, background: '#fff' }} />Hoje (borda verde)</li>
              </ul>
            </div>
          </div>

          {/* PAINEL LATERAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,.06)', padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#445' }}>Selecione uma data</div>
              <div style={{ fontSize: 12, color: '#7b8', marginTop: 4 }}>Clique em um dia do calendário para ver os avisos</div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #52b788 100%)', color: '#fff', borderRadius: 14, padding: 20 }}>
              {!selected ? (
                <div style={{ textAlign: 'center', opacity: .9 }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>🗓️</div>
                  Selecione um dia no calendário para visualizar os avisos
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Avisos de {selected.split('-').reverse().join('/')}</div>
                    {loading && <span style={{ fontSize: 12, opacity: .8 }}>carregando…</span>}
                  </div>

                  {selectedItems.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                      Nenhum aviso para este dia.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {selectedItems.map((it, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: 10 }}>
                          <div style={{ fontWeight: 700 }}>{it.nomePlanta}</div>
                          <div style={{ fontSize: 12, opacity: .9 }}>Rega: {it.rega} (a cada {it.intervaloDias} {it.intervaloDias > 1 ? 'dias' : 'dia'})</div>
                        </div>
                      ))}
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