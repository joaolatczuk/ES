import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topo from '../components/Topo.jsx';
import FormularioReceita from '../components/FormularioReceita.jsx';
import Publicadas from '../components/Publicadas.jsx';
import Enviadas from '../components/Enviadas.jsx';
import Moderacao from '../components/Moderacao.jsx';
import Favoritas from '../components/Favoritas.jsx';

function Conteudo() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';
  const idUsuario = user?.id;
  const tipoUsuario = user?.role;

  const [menuAberto, setMenuAberto] = useState(false);
  const [receitas, setReceitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtro, setFiltro] = useState('');

  const [categorias, setCategorias] = useState([]);
  const [epocas, setEpocas] = useState([]);
  const [solos, setSolos] = useState([]);
  const [exposicoes, setExposicoes] = useState([]);

  // Estilos do componente definidos como um objeto JS
  const styles = {
    conteudoWrapper: {
      backgroundColor: '#f3f6f9',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
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
    conteudoCentralizado: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
    },
    botoesSuperiores: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '20px',
      justifyContent: 'center',
      marginTop: '30px', // Aumenta o espaçamento superior para empurrar os botões para baixo
    },
    botao: {
      backgroundColor: '#fff',
      color: '#3a414b',
      padding: '10px 15px',
      borderRadius: '12px',
      border: '1px solid #ddd',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    botaoHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    botaoImg: {
      width: '20px',
      height: '20px',
    },
    homeContainer: {
      padding: '20px',
      backgroundColor: '#f3f6f9',
    },
    contentMax: { maxWidth: 1120, margin: '20px auto', padding: '10px' },
    pageWrapper: { backgroundColor: '#f3f6f9', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
    
  };

  useEffect(() => {
    let rota = 'http://localhost:5000/api/conteudos';

    if (filtro === 'favoritas') {
      rota = `http://localhost:5000/api/favoritos/${idUsuario}`;
    } else if (filtro === 'moderacao') {
      rota = 'http://localhost:5000/api/conteudos/pendentes';
    } else if (filtro === 'enviadas') {
      rota = `http://localhost:5000/api/conteudos/enviadas/${idUsuario}`;
    }

    axios.get(rota)
      .then(res => {
        setReceitas(res.data);
      })
      .catch(err => console.error('ERRO AO BUSCAR RECEITAS:', err));
  }, [filtro, idUsuario]);

  useEffect(() => {
    async function carregarOpcoesFormulario() {
      try {
        const [cat, ep, so, sol] = await Promise.all([
          axios.get('http://localhost:5000/api/conteudocategoria'),
          axios.get('http://localhost:5000/api/conteudoepoca'),
          axios.get('http://localhost:5000/api/conteudosolo'),
          axios.get('http://localhost:5000/api/conteudosol')
        ]);
        setCategorias(cat.data);
        setEpocas(ep.data);
        setSolos(so.data);
        setExposicoes(sol.data);
      } catch (error) {
        console.error('Erro ao carregar opções de formulário:', error);
      }
    }
    carregarOpcoesFormulario();
  }, []);

  const deslogar = () => {
    localStorage.clear();
    navigate('/');
  };

  const atualizarStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });
      const res = await axios.get('http://localhost:5000/api/conteudos/pendentes');
      setReceitas(res.data);
    } catch (error) {
      console.error('ERRO AO ATUALIZAR STATUS:', error);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* TOPO IGUAL AO DE CONTEUDO */}
      <div style={styles.topBar}>
        <Topo centralizado comMenu onMenuToggle={() => setMenuAberto(v => !v)} />
        {menuAberto && (
          <div style={styles.menuLateral}>
            <button onClick={() => { localStorage.clear(); navigate('/'); }}>Sair</button>
          </div>
        )}
      </div>
      <div style={styles.conteudoCentralizado}>
        <div style={styles.botoesSuperiores}> {/* Adicionado margin-top aqui */}
          <button style={styles.botao} onClick={() => navigate('/home')}>
            <img src="/back.png" alt="Voltar" style={styles.botaoImg} />
            <span>Voltar</span>
          </button>
          {isAdmin && (
            <button
              style={styles.botao}
              onClick={() => {
                setFiltro('moderacao');
                setMostrarFormulario(false);
              }}
            >
              <img src="/admin.png" alt="Moderação" style={styles.botaoImg} />
              <span>Moderação</span>
            </button>
          )}
          <button style={styles.botao} onClick={() => { setFiltro('publicadas'); setMostrarFormulario(false); }}>
            <img src="/cook-book.png" alt="Publicadas" style={styles.botaoImg} />
            <span>Publicadas</span>
          </button>
          <button style={styles.botao} onClick={() => { setFiltro('enviadas'); setMostrarFormulario(false); }}>
            <img src="/recipe-sent.png" alt="Enviadas" style={styles.botaoImg} />
            <span>Enviadas</span>
          </button>
          <button style={styles.botao} onClick={() => { setFiltro('favoritas'); setMostrarFormulario(false); }}>
            <img src="/favorite.png" alt="Favoritas" style={styles.botaoImg} />
            <span>Favoritas</span>
          </button>
          <button style={styles.botao} onClick={() => setMostrarFormulario(!mostrarFormulario)}>
            <img src="/add.png" alt="Adicionar" style={styles.botaoImg} />
            <span>{mostrarFormulario ? 'Cancelar' : 'Adicionar'}</span>
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <FormularioReceita
          idUsuario={idUsuario}
          categorias={categorias}
          epocas={epocas}
          solos={solos}
          exposicoes={exposicoes}
          onSucesso={() => {
            setMostrarFormulario(false);
            axios.get('http://localhost:5000/api/conteudos')
              .then(res => setReceitas(res.data));
          }}
        />
      )}

      <div style={styles.homeContainer}>
        {!mostrarFormulario && (
          <>
            {filtro === 'publicadas' && <Publicadas receitas={receitas} />}
            {filtro === 'enviadas' && <Enviadas receitas={receitas} idUsuario={idUsuario} />}
            {filtro === 'moderacao' && isAdmin && <Moderacao receitas={receitas} atualizarStatus={atualizarStatus} />}
            {filtro === 'favoritas' && <Favoritas receitas={receitas} />}
          </>
        )}
      </div>
    </div>
  );
}

export default Conteudo;