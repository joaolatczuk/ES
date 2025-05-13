import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';
import Topo from './Topo';

function Conteudo() {
  const navigate = useNavigate();

  // ✅ Pega os dados do usuário logado corretamente
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';
  const idUsuario = user?.id;
  const nomeAutor = user?.nome || 'Anônimo';
  const tipoUsuario = user?.role;

  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtro, setFiltro] = useState(''); // Nenhum filtro ativo por padrão


  const [nomePlanta, setNomePlanta] = useState('');
  const [imagens, setImagens] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [epoca, setEpoca] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [solo, setSolo] = useState('');
  const [rega, setRega] = useState('');
  const [frequenciaUnidade, setFrequenciaUnidade] = useState('');
  const [sol, setSol] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/notificacoes/${idUsuario}`)
      .then(res => {
        const novas = res.data.filter(n => !n.visualizado);
        setNotificacoes(novas);
      })
      .catch(err => console.error('Erro ao buscar notificações:', err));
  }, []);

  useEffect(() => {
    if (filtro === 'favoritas') {
      axios.get(`http://localhost:5000/api/favoritos/${idUsuario}`)
        .then(res => {
          console.log("Favoritas:", res.data); // 👈 VERIFIQUE AQUI
          setReceitas(res.data);
        })
        .catch(err => console.error('Erro ao buscar favoritas:', err));
    } else {
      axios.get('http://localhost:5000/api/conteudos')
        .then(res => setReceitas(res.data))
        .catch(err => console.error('Erro ao buscar receitas:', err));
    }
  }, [filtro]);


  const deslogar = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const postarReceita = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nomePlanta', nomePlanta);
      formData.append('categoria', categoria);
      formData.append('epoca', epoca);
      formData.append('temperatura', temperatura);
      formData.append('solo', solo);
      formData.append('rega', `${rega} ${frequenciaUnidade}`);
      formData.append('sol', sol);
      formData.append('instrucoes', instrucoes);
      formData.append('id_autor', idUsuario);
      imagens.forEach(imagem => formData.append('imagens', imagem));

      await axios.post('http://localhost:5000/api/conteudos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNomePlanta('');
      setCategoria('');
      setEpoca('');
      setTemperatura('');
      setSolo('');
      setRega('');
      setFrequenciaUnidade('');
      setSol('');
      setInstrucoes('');
      setImagens([]);
      setMostrarFormulario(false);

      const res = await axios.get('http://localhost:5000/api/conteudos');
      setReceitas(res.data);
      setMensagemSucesso('Receita postada com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao postar receita:', error);
    }
  };

  const atualizarStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });
      const res = await axios.get('http://localhost:5000/api/conteudos');
      setReceitas(res.data);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const excluirReceita = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/conteudos/${id}`);
      const res = await axios.get('http://localhost:5000/api/conteudos');
      setReceitas(res.data);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  };

  return (
    <div className="conteudo-wrapper">
      <div className="top-bar">
        {/* TOPO PERSONALIZADO */}
        <Topo centralizado comMenu onMenuClick={() => setMenuAberto(!menuAberto)} />

        {/* MENU LATERAL */}
        {menuAberto && (
          <div className="menu-lateral">
            <button onClick={deslogar}>Sair</button>
          </div>
        )}
      </div>

      <div className="botoes-superiores">
        <button onClick={() => navigate('/home')}>
          <img src="/back.png" alt="Voltar" />
          <span>Voltar</span>
        </button>
        {isAdmin && (
          <button onClick={() => navigate('/moderacao')}>
            <img src="/admin.png" alt="Moderação" />
            <span>Moderação</span>
          </button>
        )}

        <button onClick={() => { setFiltro('favoritas'); setMostrarFormulario(false); }}>
          <img src="/star.png" alt="Favoritas" />
          <span>Favoritas</span>
        </button>
        <button onClick={() => { setFiltro('publicadas'); setMostrarFormulario(false); }}>
          <img src="/cook-book.png" alt="Publicadas" />
          <span>Publicadas</span>
        </button>
        <button onClick={() => { setFiltro('enviadas'); setMostrarFormulario(false); }}>
          <img src="/recipe-sent.png" alt="Enviadas" />
          <span>Enviadas</span>
        </button>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          <img src="/add.png" alt="Adicionar" />
          <span>{mostrarFormulario ? 'Cancelar' : 'Adicionar'}</span>
        </button>
      </div>

      {mostrarFormulario && (
        <form className="formulario" onSubmit={postarReceita}>
          <label>Nome da planta:</label>
          <input
            type="text"
            className="input-verde"
            value={nomePlanta}
            onChange={e => setNomePlanta(e.target.value)}
            required
          />
          <label>Imagens do plantio:</label>
          <input type="file" multiple onChange={e => setImagens(Array.from(e.target.files))} />
          <label>Categoria:</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
            <option value="">Selecione</option>
            <option value="flor">Flor</option>
            <option value="fruta">Fruta</option>
            <option value="legume">Legume</option>
          </select>
          <label>Época ideal de plantio:</label>
          <select value={epoca} onChange={e => setEpoca(e.target.value)} required>
            <option value="">Selecione</option>
            <option value="primavera">Primavera</option>
            <option value="verao">Verão</option>
            <option value="outono">Outono</option>
            <option value="inverno">Inverno</option>
          </select>
          <label>Temperatura ideal (°C):</label>
          <div className="input-numero-custom">
            <button type="button" onClick={() => setTemperatura(prev => Math.max(0, Number(prev) - 1))}>–</button>
            <input className="input-valor" value={temperatura} readOnly />
            <button type="button" onClick={() => setTemperatura(prev => Number(prev) + 1)}>+</button>
          </div>
          <label>Tipo de solo:</label>
          <input
            type="text"
            className="input-verde"
            value={solo}
            onChange={e => setSolo(e.target.value)}
          />

          <label>Frequência de rega:</label>
          <div className="input-numero-unidade">
            <div className="input-numero-custom" style={{ maxWidth: 'calc(50% - 5px)' }}>
              <button type="button" onClick={() => setRega(prev => Math.max(0, Number(prev) - 1))}>–</button>
              <input className="input-valor" value={rega} readOnly />
              <button type="button" onClick={() => setRega(prev => Number(prev) + 1)}>+</button>
            </div>
            <select className="input-unidade" value={frequenciaUnidade} onChange={e => setFrequenciaUnidade(e.target.value)} required>
              <option value="">Unidade</option>
              <option value="dia">por dia</option>
              <option value="semana">por semana</option>
              <option value="mês">por mês</option>
            </select>
          </div>
          <label>Exposição ao sol:</label>
          <select value={sol} onChange={e => setSol(e.target.value)} required>
            <option value="">Selecione</option>
            <option value="pleno sol">Pleno sol – mínimo de 4h de sol direto</option>
            <option value="meia sombra">Meia sombra – algumas horas com luz direta</option>
            <option value="sombra">Sombra – luz indireta, sem sol direto</option>
          </select>
          <label>Instruções de plantio:</label>
          <textarea value={instrucoes} onChange={e => setInstrucoes(e.target.value)} required />
          <button type="submit">Postar Receita</button>
        </form>
      )}

      <div className="home-container">
        {!mostrarFormulario && (
          <div className="receita-lista">
            {filtro && receitas
              .filter(r => {
                if (filtro === 'favoritas') return true;
                if (filtro === 'publicadas') return r.status === 'aprovado';
                if (filtro === 'enviadas') return r.id_autor == idUsuario;
                if (filtro === 'moderacao') return tipoUsuario === 'admin' && r.status === 'pendente';
                return false;
              })
              .map((r) => (
                <div key={r.id || r.id_conteudo} className="receita-card simples">
                  <img
                    src={`http://localhost:5000${r.imagens && r.imagens.length > 0 ? r.imagens[0] : '/uploads/no-image.png'}`}
                    alt={r.nomePlanta}
                    className="receita-imagem"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'http://localhost:5000/uploads/no-image.png';
                    }}
                  />
                  <h3>{r.nomePlanta}</h3>
                  {(r?.id || r?.id_conteudo) && (
                    <button className="btn-ver" onClick={() => navigate(`/receita/${r.id || r.id_conteudo}`)}>Ver</button>
                  )}



                </div>
              ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default Conteudo;
