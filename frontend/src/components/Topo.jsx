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
    <div className="top-bar top-bar-centralizado">
      <div className="top-bar-content">
        {/* Ícone de menu com dropdown */}
        {comMenu && (
          <div className="menu-container">
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

        {/* Logo central */}
        <img src="/logo.png" alt="Logo AgroPlanner" className="logo-topo" />

        {/* Notificações no canto direito */}
        <div className="top-bar-right">
          {comNotificacoes && (
            <div className="notificacao-icone">
              <img
                src={notificacoes.length > 0 ? "/notification-yes.png" : "/notification-no.png"}
                alt="Notificações"
                className="notificacao-img"
              />
              {notificacoes.length > 0 && (
                <span className="notificacao-contador">{notificacoes.length}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topo;