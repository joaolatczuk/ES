import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/style.css';
import Topo from '../components/Topo';

function Home() {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const idUsuario = user?.id;

  const deslogar = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="pagina">
      <Topo
        comMenu
        onMenuClick={() => setMenuAberto(!menuAberto)}
      />

      {menuAberto && (
        <div className="menu-lateral">
          <button onClick={deslogar}>Sair</button>
        </div>
      )}

      <div className="home-container">
        <div className="home-card">
          <Link to="/forum" className="home-link">
            <img src="/forum.png" alt="Fórum" className="card-icon" />
            <h3>FÓRUM</h3>
            <p>Venha conversar com colegas de plantio.</p>
          </Link>

          <Link to="/calendario" className="home-link">
            <img src="/calendar.png" alt="Calendário" className="card-icon" />
            <h3>Calendário</h3>
            <p>Verifique as datas!!</p>
          </Link>

          <Link to="/conteudo" className="home-link">
            <img src="/content.png" alt="Conteúdo" className="card-icon" />
            <h3>Conteúdo</h3>
            <p>Venha ver receitas para você plantar</p>
          </Link>
        </div>

        <p className="duvida">Não encontrou o que gostaria?</p>
        <button className="fale-conosco">Fale conosco</button>
      </div>
    </div>
  );
}

export default Home;
