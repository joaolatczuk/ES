import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topo from '../components/Topo';
import '../styles/style.css';

function ReceitaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [receita, setReceita] = useState(null);
  const [favorito, setFavorito] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const idUsuario = user?.id;
  const isModerador = user?.role === 'admin'; // ou outro tipo que indique moderação

  useEffect(() => {
    axios.get(`http://localhost:5000/api/conteudos/${id}`)
      .then(res => setReceita(res.data))
      .catch(err => console.error('Erro ao buscar receita:', err));
  }, [id]);

  useEffect(() => {
    if (!idUsuario) return;
    axios.get(`http://localhost:5000/api/favoritos/${idUsuario}`)
      .then(res => {
        const favoritosIds = res.data.map(f => f.id_conteudo);
        setFavorito(favoritosIds.includes(Number(id)));
      })
      .catch(err => console.error('Erro ao verificar favorito:', err));
  }, [id, idUsuario]);

  const toggleFavorito = () => {
    const url = `http://localhost:5000/api/favoritos/${idUsuario}/${id}`;
    if (favorito) {
      axios.delete(url).then(() => setFavorito(false));
    } else {
      axios.post(url).then(() => setFavorito(true));
    }
  };

  const atualizarStatus = async (status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });
      navigate('/moderacao');
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  if (!receita) return <div>Carregando receita...</div>;

  const dataFormatada = new Date(receita.data_publicacao).toLocaleDateString('pt-BR');

  return (
    <div className="receita-detalhe-container">
      <Topo centralizado comMenu onMenuClick={() => setMenuAberto(!menuAberto)} />
      {menuAberto && (
        <div className="menu-lateral">
          <button onClick={() => navigate('/')}>Início</button>
          <button onClick={() => localStorage.clear() || navigate('/')}>Sair</button>
        </div>
      )}

      <h1 className="receita-titulo">🌿 {receita.nomePlanta}</h1>

      {receita.imagens?.length > 0 ? (
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
        <p><strong>👤 Autor:</strong> {receita.autor || 'Anônimo'}</p>
        <p><strong>📅 Publicada em:</strong> {dataFormatada}</p>
        <hr />
        <p><strong>🗂️ Categoria:</strong> {receita.categoria}</p>
        <p><strong>🗓️ Época de plantio:</strong> {receita.epoca}</p>
        <p><strong>🌡️ Temperatura ideal:</strong> {receita.temperatura}°C</p>
        <p><strong>🌱 Solo:</strong> {receita.solo}</p>
        <p><strong>💧 Frequência de rega:</strong> {receita.rega}</p>
        <p><strong>☀️ Exposição ao sol:</strong> {receita.sol}</p>
        <p><strong>📋 Instruções detalhadas:</strong></p>
        <div style={{ backgroundColor: '#f1f1f1', padding: '1rem', borderRadius: '10px' }}>
          <p>{receita.instrucoes}</p>
        </div>
      </div>

      <div className="botoes-aprovacao">
        <button className="btn-voltar-especial" onClick={() => navigate(-1)}>← Voltar</button>

        {isModerador && (
          <>
            <button className="btn-aprovar" onClick={() => atualizarStatus('aprovado')}>✅ Aprovar</button>
            <button className="btn-rejeitar" onClick={() => atualizarStatus('rejeitado')}>❌ Rejeitar</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ReceitaDetalhe;
