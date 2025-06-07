import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topo from '../components/Topo';
import '../styles/style.css';
import '../styles/style.css';

function ReceitaDetalhe() {
  const { id } = useParams();
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const [receita, setReceita] = useState(null);
  const [favorito, setFavorito] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const idUsuario = user?.id;

  // Carregar receita
  useEffect(() => {
    axios.get(`http://localhost:5000/api/conteudos`)
      .then(res => {
        const encontrada = res.data.find(r => String(r.id) === id);
        setReceita(encontrada);
      })
      .catch(err => console.error('Erro ao buscar receita:', err));
  }, [id]);

  // Verificar se está favoritado
  useEffect(() => {
    if (!idUsuario) return;
    axios.get(`http://localhost:5000/api/favoritos/${idUsuario}`)
      .then(res => {
        const favoritosIds = res.data.map(f => f.id_conteudo);
        setFavorito(favoritosIds.includes(Number(id)));
      })
      .catch(err => console.error('Erro ao verificar favorito:', err));
  }, [id, idUsuario]);

  // Alternar favorito
  const toggleFavorito = () => {
    const url = `http://localhost:5000/api/favoritos/${idUsuario}/${id}`;
    if (favorito) {
      axios.delete(url).then(() => setFavorito(false));
    } else {
      axios.post(url).then(() => setFavorito(true));
    }
  };

  if (!receita) return <div>Carregando receita...</div>;

  return (
    <div className="receita-detalhe-container">
      <Topo centralizado comMenu onMenuClick={() => setMenuAberto(!menuAberto)} />
      {menuAberto && (
        <div className="menu-lateral">
          <button onClick={() => navigate('/')}>Início</button>
          <button onClick={() => localStorage.clear() || navigate('/')}>Sair</button>
        </div>
      )}

      <h1 className="receita-titulo">{receita.nomePlanta}</h1>

      {receita.imagens && receita.imagens.length > 0 ? (
        <img
          src={`http://localhost:5000${receita.imagens[0]}`}
          alt={receita.nomePlanta}
          className="receita-imagem-grande"
        />
      ) : (
        <img
          src="http://localhost:5000/uploads/no-image.png"
          alt="Sem imagem"
          className="receita-imagem-grande"
        />
      )}

      <div className="receita-info">
        <p><strong>🌿 Categoria:</strong> {receita.categoria}</p>
        <p><strong>🗓️ Época:</strong> {receita.epoca}</p>
        <p><strong>🌡️ Temperatura:</strong> {receita.temperatura}°C</p>
        <p><strong>🌱 Tipo de solo:</strong> {receita.solo}</p>
        <p><strong>💧 Rega:</strong> {receita.rega}</p>
        <p><strong>☀️ Sol:</strong> {receita.sol}</p>
        <p><strong>📋 Instruções de plantio:</strong></p>
        <p>{receita.instrucoes}</p>
      </div>

      <button onClick={() => navigate(-1)} className="btn-voltar">← Voltar</button>
    </div>
  );
}

export default ReceitaDetalhe;
