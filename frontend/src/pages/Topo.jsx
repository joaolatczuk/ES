import React from 'react';
import './style.css';

function Topo({ comMenu, comNotificacoes, notificacoes = [], onMenuClick, onSair }) {
  return (
    <div className="top-bar top-bar-centralizado">
      <div className="top-bar-content">
        {/* Ícone de menu (esquerda) */}
        {comMenu && (
          <img
            src="/menu.png"
            alt="Menu"
            className="menu-icon"
            onClick={onMenuClick}
          />
        )}

        {/* Logo central */}
        <img src="/logo.png" alt="Logo AgroPlanner" className="logo-topo" />

        {/* Área direita: notificações + botão sair */}
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

          {/* Botão sair no canto superior direito */}
          {onSair && (
            <button className="botao-sair" onClick={onSair}>Sair</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topo;