import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ReceitaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receita, setReceita] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const isModerador = user?.role === 'admin'; // ou 'moderador'

  useEffect(() => {
    axios.get(`http://localhost:5000/api/conteudos/${id}`)
      .then(res => setReceita(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const atualizarStatus = async (status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });
      navigate('/moderacao'); // voltar para moderação após ação
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  if (!receita) return <p>Carregando...</p>;

  return (
    <div className="receita-detalhe-container">
      <h2 className="receita-titulo">{receita.nomePlanta}</h2>
      <img
        className="receita-imagem-grande"
        src={`http://localhost:5000${receita.imagens?.[0] || '/uploads/no-image.png'}`}
        alt={receita.nomePlanta}
      />
      <div className="receita-info">
        <p><strong>Categoria:</strong> {receita.categoria}</p>
        <p><strong>Época:</strong> {receita.epoca}</p>
        <p><strong>Solo:</strong> {receita.solo}</p>
        <p><strong>Rega:</strong> {receita.rega}</p>
        <p><strong>Sol:</strong> {receita.sol}</p>
        <p><strong>Instruções:</strong> {receita.instrucoes}</p>
      </div>

      <div className="botoes-aprovacao">
        <button className="btn-voltar" onClick={() => navigate(-1)}>Voltar</button>
        {isModerador && (
          <>
            <button className="btn-aprovar" onClick={() => atualizarStatus('aprovado')}>Aprovar</button>
            <button className="btn-rejeitar" onClick={() => atualizarStatus('rejeitado')}>Rejeitar</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ReceitaDetalhe;