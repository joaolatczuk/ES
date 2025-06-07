import React from 'react';

function Moderacao({ receitas, atualizarStatus }) {
  return (
    <div className="receita-lista">
      {receitas
        .filter(r => r.status === 'pendente')
        .map(r => (
          <div key={r.id || r.id_conteudo} className="receita-card">
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
            <p><strong>Categoria:</strong> {r.categoria}</p>
            <p><strong>Autor:</strong> {r.autor || 'Desconhecido'}</p>
            <p><strong>Data:</strong> {new Date(r.data_publicacao).toLocaleDateString()}</p>

            <div className="botoes-aprovacao">
              <button className="btn-aprovar" onClick={() => atualizarStatus(r.id || r.id_conteudo, 'aprovado')}>Aprovar</button>
              <button className="btn-rejeitar" onClick={() => atualizarStatus(r.id || r.id_conteudo, 'rejeitado')}>Rejeitar</button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Moderacao;