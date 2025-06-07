import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topo from '../components/Topo'; 

function Forum() {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const deslogar = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div>
      {/* Topo com menu */}
      <div className="top-bar">
        <Topo comMenu onMenuClick={() => setMenuAberto(!menuAberto)} onSair={deslogar} />
        {menuAberto && (
          <div className="menu-lateral">
            <button onClick={() => navigate('/home')}>Início</button>
            <button onClick={() => navigate('/forum')}>Fórum</button>
            <button onClick={() => navigate('/calendario')}>Calendário</button>
            <button onClick={() => navigate('/conteudo')}>Conteúdo</button>
            <button onClick={deslogar}>Sair</button>
          </div>
        )}
      </div>

      {/* Conteúdo da página */}
      <div className="page">
        <h1>Fórum</h1>
      </div>
    </div>
  );
}

export default Forum;