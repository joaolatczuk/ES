import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Topo({ comMenu }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuAberto(!menuAberto);

  const irPara = (rota) => {
    navigate(rota);
    setMenuAberto(false);
  };

  const sair = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const styles = {
    menuContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '250px',
      backgroundColor: '#fff',
      borderRight: '1px solid #ccc',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      zIndex: 999,
      transform: menuAberto ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '60px',
    },
    menuOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '100vw',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 998,
      display: menuAberto ? 'block' : 'none',
    },
    menuFixoEsquerda: {
      position: 'fixed',
      top: '12.5px',
      left: '12.5px',
      zIndex: 1000,
    },
    menuIcon: {
      width: '30px',
      height: '30px',
      cursor: 'pointer',
    },
    menuButton: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: '12px 20px',
      fontSize: '1rem',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderRadius: '4px',
      color: '#333',
      width: '100%',
    },
    logoCentralTopo: {
      position: 'relative',
      width: '100%',
      textAlign: 'center',
      padding: '5px 0',
      backgroundColor: '#fff',
    },
    logoTopo: {
      height: '40px',
    },
  };

  return (
    <>
      {/* Menu no canto superior esquerdo */}
      {comMenu && (
        <div style={styles.menuFixoEsquerda}>
          <img
            src="/menu.png"
            alt="Menu"
            style={styles.menuIcon}
            onClick={toggleMenu}
          />
        </div>
      )}

      {/* Menu lateral animado */}
      {comMenu && (
        <>
          <div style={styles.menuOverlay} onClick={toggleMenu} />
          <div style={styles.menuContainer}>
            <button style={styles.menuButton} onClick={() => irPara('/home')}>Início</button>
            <button style={styles.menuButton} onClick={() => irPara('/calendario')}>Calendário</button>
            <button style={styles.menuButton} onClick={() => irPara('/conteudo')}>Conteúdo</button>
            <button style={styles.menuButton} onClick={sair}>Sair</button>
          </div>
        </>
      )}

      {/* Logo Central no Topo */}
      <div style={styles.logoCentralTopo}>
        <img src="/logo.png" alt="Logo AgroPlanner" style={styles.logoTopo} />
      </div>
    </>
  );
}

export default Topo;