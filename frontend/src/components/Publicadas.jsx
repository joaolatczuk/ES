import React from 'react';
import { useNavigate } from 'react-router-dom';

function Publicadas({ receitas }) {
  const navigate = useNavigate();

  // Filtra somente as receitas aprovadas
  const receitasAprovadas = receitas.filter(r => r.status === 'aprovado');

  return (
    <div className="receita-lista">
      {receitasAprovadas.length === 0 ? (
        <p className="mensagem-vazia">Nenhuma receita publicada ainda.</p>
      ) : (
        receitasAprovadas.map(r => {
          const dataFormatada = new Date(r.data_publicacao).toLocaleDateString('pt-BR');
          return (
            <div key={r.id || r.id_conteudo} className="receita-card simples">
              <img
                src={`http://localhost:5000${r.imagens?.[0] || '/uploads/no-image.png'}`}
                alt={r.nomePlanta}
                className="receita-imagem"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = 'http://localhost:5000/uploads/no-image.png';
                }}
              />

              <h3>{r.nomePlanta}</h3>
              <p><strong>Autor:</strong> {r.autor || 'Anônimo'}</p>
              <p><strong>Publicado em:</strong> {dataFormatada}</p>

              <button
                className="btn-ver"
                onClick={() => navigate(`/receita/${r.id || r.id_conteudo}`)}
              >
                Ver receita
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Publicadas;
