// ✅ Conteudo.jsx atualizado com FormularioReceita e componentes modularizados
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/style.css';
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

  useEffect(() => {
    let rota = 'http://localhost:5000/api/conteudos';

    if (filtro === 'favoritas') {
      rota = `http://localhost:5000/api/favoritos/${idUsuario}`;
    } else if (filtro === 'moderacao') {
      rota = 'http://localhost:5000/api/conteudos/pendentes';
    }

    axios.get(rota)
      .then(res => {
        setReceitas(res.data);
        console.log('Receitas carregadas:', res.data);
      })
      .catch(err => console.error('ERRO AO BUSCAR RECEITAS:', err));
  }, [filtro]);

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
    window.location.href = '/';
  };

  const atualizarStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });
      const res = await axios.get('http://localhost:5000/api/conteudos');
      setReceitas(res.data);
    } catch (error) {
      console.error('ERRO AO ATUALIZAR STATUS:', error);
    }
  };

  return (
    <div className="conteudo-wrapper">
      <div className="top-bar">
        <Topo centralizado comMenu/>
        {menuAberto && (
          <div className="menu-lateral">
            <button onClick={deslogar}>Sair</button>
          </div>
        )}

      </div>

      <div className="conteudo-centralizado">
        <div className="botoes-superiores">
          <button onClick={() => navigate('/home')}>
            <img src="/back.png" alt="Voltar" />
            <span>Voltar</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                console.log("Clicou em Moderação");
                setFiltro('moderacao');
                setMostrarFormulario(false);
              }}
            >
              <img src="/admin.png" alt="Moderação" />
              <span>Moderação</span>
            </button>
          )}
          <button onClick={() => { setFiltro('publicadas'); setMostrarFormulario(false); }}>
            <img src="/cook-book.png" alt="Publicadas" />
            <span>Publicadas</span>
          </button>
          <button onClick={() => { setFiltro('enviadas'); setMostrarFormulario(false); }}>
            <img src="/recipe-sent.png" alt="Enviadas" />
            <span>Enviadas</span>
          </button>
          <button onClick={() => { setFiltro('favoritas'); setMostrarFormulario(false); }}>
            <img src="/favorite.png" alt="Favoritas" />
            <span>Favoritas</span>
          </button>
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
            <img src="/add.png" alt="Adicionar" />
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

      <div className="home-container">
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
