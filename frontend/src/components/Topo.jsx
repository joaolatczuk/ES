import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/style.css';

function Topo({ comMenu, comNotificacoes, notificacoes = [], onSair }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuAberto(!menuAberto);

  const irPara = (rota) => {
    navigate(rota);
    setMenuAberto(false);
  };

  return (
    <>
      {/* Menu no canto superior esquerdo */}
      {comMenu && (
        <div className="menu-fixo-esquerda">
          <img
            src="/menu.png"
            alt="Menu"
            className="menu-icon"
            onClick={toggleMenu}
          />
          {menuAberto && (
            <div className="menu-lateral">
              <button onClick={() => irPara('/home')}>Início</button>
              <button onClick={() => irPara('/forum')}>Fórum</button>
              <button onClick={() => irPara('/calendario')}>Calendário</button>
              <button onClick={() => irPara('/conteudo')}>Conteúdo</button>
              <button onClick={onSair}>Sair</button>
            </div>
          )}
        </div>
      )}

      {/* Logo Central no Topo */}
      <div className="logo-central-topo">
        <img src="/logo.png" alt="Logo AgroPlanner" className="logo-topo" />
      </div>
    </>
  );
}

export default Topo;