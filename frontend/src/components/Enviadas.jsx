import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Enviadas({ receitas, idUsuario }) {
  const navigate = useNavigate();

  const excluirReceita = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/excluir`);
      window.location.reload(); // Recarrega a lista
    } catch (err) {
      console.error('Erro ao excluir receita:', err);
    }
  };

  return (
    <div className="receita-lista">
      {receitas
        .filter(
          r =>
            r.id_autor == idUsuario &&
            r.statusAtivo !== 0 &&
            r.status !== 'rejeitado'
        )
        .map(r => (
          <div key={r.id || r.id_conteudo} className="receita-card simples">
            <img
              src={`http://localhost:5000${r.imagens?.[0] || '/uploads/no-image.png'}`}
              alt={r.nomePlanta}
              className="receita-imagem"
              onError={e => e.target.src = 'http://localhost:5000/uploads/no-image.png'}
            />
            <h3>{r.nomePlanta}</h3>
            {r.status === 'pendente' && (
              <>
                <p className="aguardando">⏳ Aguardando moderação</p>
                <button className="btn-excluir" onClick={() => excluirReceita(r.id || r.id_conteudo)}>Excluir</button>
              </>
            )}
            {r.status === 'aprovado' && (
              <>
                <button className="btn-ver" onClick={() => navigate(`/receita/${r.id || r.id_conteudo}`)}>Ver</button>
                <button className="btn-excluir" onClick={() => excluirReceita(r.id || r.id_conteudo)}>Excluir</button>
              </>
            )}
          </div>
        ))}
    </div>
  );
}

export default Enviadas;