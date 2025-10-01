import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div style={styles.pagina}>
      <div style={styles.topBar}>
        <Topo
          centralizado
          comMenu
          onMenuClick={() => setMenuAberto(!menuAberto)}
        />
        {menuAberto && (
          <div style={styles.menuLateral}>
            <button onClick={deslogar} style={styles.botaoSair}>Sair</button>
          </div>
        )}
      </div>

      <div style={styles.homeContainer}>
        <div style={styles.homeCard}>
          {/* Cartão de Calendário */}
          <Link to="/calendario" style={styles.homeLink}>
            <img src="/calendar.png" alt="Calendário" style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>Calendário</h3>
            <p style={styles.cardText}>Verifique as datas!!</p>
          </Link>

          {/* Cartão de Conteúdo */}
          <Link to="/conteudo" style={styles.homeLink}>
            <img src="/content.png" alt="Conteúdo" style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>Conteúdo</h3>
            <p style={styles.cardText}>Venha ver receitas para você plantar</p>
          </Link>

          {/* NOVO - Cartão de Perfil do Usuário */}
          <Link to="/perfil" style={styles.homeLink}>
            <img src="/user.png" alt="Perfil do Usuário" style={styles.cardIcon} /> {/* Use um ícone de sua preferência */}
            <h3 style={styles.cardTitle}>Meu Perfil</h3>
            <p style={styles.cardText}>Altere suas informações</p>
          </Link>
        </div>

        <p style={styles.duvida}>Não encontrou o que gostaria?</p>
        <button style={styles.faleConosco}>Fale conosco</button>
      </div>
    </div>
  );
}

const styles = {
  pagina: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f1f1f1',
    paddingTop: '60px',
  },
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    padding: '10px 20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'center',
  },
  menuLateral: {
    position: 'fixed',
    top: '60px',
    right: '20px',
    width: '250px',
    backgroundColor: '#fff',
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: '1000',
  },
  botaoSair: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#d62828',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  homeContainer: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  homeCard: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '30px',
  },
  homeLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    color: '#333',
    width: '200px',
    textAlign: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  cardIcon: {
    width: '80px',
    height: '80px',
    marginBottom: '15px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    margin: '0',
    color: '#2d6a4f',
  },
  cardText: {
    fontSize: '0.9rem',
    color: '#666',
  },
  duvida: {
    fontSize: '1.2rem',
    color: '#555',
  },
  faleConosco: {
    padding: '12px 24px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
};

export default Home;