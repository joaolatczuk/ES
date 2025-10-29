// src/components/Topo.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function pad2(n) { return String(n).padStart(2, '0'); }
function iso(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
}

function Topo({ comMenu = true }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [temPendenciasHoje, setTemPendenciasHoje] = useState(false);
  const [checando, setChecando] = useState(false);

  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const API_BASE = useMemo(() => process.env.REACT_APP_API_BASE || 'http://localhost:5000', []);

  const toggleMenu = () => setMenuAberto(v => !v);

  const irPara = (rota) => {
    navigate(rota);
    setMenuAberto(false);
  };

  const sair = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // === Checar pendências de HOJE ===
  useEffect(() => {
    async function checar() {
      if (!user?.id) return;
      try {
        setChecando(true);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const todayKey = iso(now);

        const r = await fetch(`${API_BASE}/api/avisos/${user.id}?year=${year}&month=${month}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();

        const entry = data?.days?.[todayKey];
        const pend = Array.isArray(entry?.items) && entry.items.some(it => !it.done);
        setTemPendenciasHoje(!!pend);
      } catch (e) {
        console.error('Falha ao checar pendências de hoje:', e);
        setTemPendenciasHoje(false);
      } finally {
        setChecando(false);
      }
    }
    checar();
  }, [API_BASE, user?.id]);

  const styles = {
    // barra fixa no topo (mantém seu layout com logo central)
    topBarWrap: {
      position: 'fixed',
      top: 0, left: 0, right: 0,
      backgroundColor: '#fff',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      zIndex: 1000,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    // sininho canto direito
    rightArea: {
      position: 'absolute',
      right: 12,
      top: 0,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    },
    bellBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 6,
      borderRadius: 8
    },
    bellImg: { width: 28, height: 28, opacity: checando ? 0.65 : 1 },

    // menu (hamburger) canto esquerdo
    menuFixoEsquerda: {
      position: 'absolute',
      left: 12.5,
      top: 12.5,
      zIndex: 1001
    },
    menuIcon: { width: 30, height: 30, cursor: 'pointer' },

    // logo central
    logoTopo: { height: 40 },

    // lateral
    menuContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: 250,
      backgroundColor: '#fff',
      borderRight: '1px solid #ccc',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      zIndex: 999,
      transform: menuAberto ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 60
    },
    menuOverlay: {
      position: 'fixed',
      top: 0, left: 0,
      height: '100vh', width: '100vw',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 998,
      display: menuAberto ? 'block' : 'none'
    },
    menuButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '1rem',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderRadius: 4,
      color: '#333',
      width: '100%'
    }
  };

  return (
    <>
      {/* Barra superior */}
      <div style={styles.topBarWrap}>
        {/* Hambúrguer */}
        {comMenu && (
          <div style={styles.menuFixoEsquerda}>
            <img src="/menu.png" alt="Menu" style={styles.menuIcon} onClick={toggleMenu} />
          </div>
        )}

        {/* Logo central */}
        <img src="/logo.png" alt="Logo AgroPlanner" style={styles.logoTopo} />

        {/* Área direita (sininho + atalho perfil) */}
        <div style={styles.rightArea}>
          <button
            style={styles.bellBtn}
            title={
              checando
                ? 'Verificando pendências…'
                : temPendenciasHoje ? 'Você tem avisos pendentes hoje' : 'Sem pendências hoje'
            }
            onClick={() => irPara('/calendario')}
          >
            <img
              style={styles.bellImg}
              src={temPendenciasHoje ? '/com-notificacao.png' : '/sem-notificacao.png'}
              alt={temPendenciasHoje ? 'Há pendências hoje' : 'Sem pendências'}
            />
          </button>
          <button
            style={styles.bellBtn}
            title="Meu perfil"
            onClick={() => irPara('/perfil')}
          >
            <img src="/user.png" alt="Perfil" width={28} height={28} />
          </button>
        </div>
      </div>

      {/* Menu lateral animado */}
      {comMenu && (
        <>
          <div style={styles.menuOverlay} onClick={toggleMenu} />
          <div style={styles.menuContainer}>
            <button style={styles.menuButton} onClick={() => irPara('/home')}>Início</button>
            <button style={styles.menuButton} onClick={() => irPara('/calendario')}>Calendário</button>
            <button style={styles.menuButton} onClick={() => irPara('/conteudo')}>Conteúdo</button>
            <button style={styles.menuButton} onClick={() => irPara('/perfil')}>Perfil</button>
            <button style={styles.menuButton} onClick={sair}>Sair</button>
          </div>
        </>
      )}

      {/* Espaçador para não esconder conteúdo (altura da topbar) */}
      <div style={{ height: 60 }} />
    </>
  );
}

export default Topo;