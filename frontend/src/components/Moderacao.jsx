import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Moderacao() {
  const [receitas, setReceitas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/conteudos/pendentes')
      .then(res => setReceitas(res.data))
      .catch(err => console.error('Erro ao buscar receitas pendentes:', err));
  }, []);

  const atualizarStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });
      navigate('/conteudo'); // redireciona após ação
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const excluirReceita = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/excluir`);
      navigate('/conteudo'); // redireciona após exclusão
    } catch (err) {
      console.error('Erro ao excluir receita:', err);
    }
  };

  return (
    <div className="moderacao-container">
      <h2>📋 Receitas pendentes de moderação</h2>
      <div className="receita-lista">
        {receitas.length === 0 ? (
          <p>Nenhuma receita pendente.</p>
        ) : (
          receitas.map((r) => {
            const idReceita = r.id || r.id_conteudo;
            return (
              <div key={idReceita} className="receita-card">
                <img
                  src={`http://localhost:5000${r.imagens?.[0] || '/uploads/no-image.png'}`}
                  alt={r.nomePlanta}
                  className="receita-imagem"
                />
                <h3>{r.nomePlanta}</h3>
                <p style={{ fontStyle: 'italic' }}>👤 {r.autor || 'Anônimo'}</p>

                <div className="status-info">
                  <span style={{ color: '#999' }}>⏳ Aguardando moderação</span>
                </div>

                <div className="botoes-acao">
                  <button className="btn-verde" onClick={() => navigate(`/receita/${idReceita}`)}>Ver</button>
                  <button className="btn-verde" onClick={() => atualizarStatus(idReceita, 'aprovado')}>Aprovar</button>
                  <button className="btn-cinza" onClick={() => atualizarStatus(idReceita, 'rejeitado')}>Rejeitar</button>
                  <button className="btn-vermelho" onClick={() => excluirReceita(idReceita)}>Excluir</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Moderacao;