import React from 'react';
import { useNavigate } from 'react-router-dom';

function Favoritas({ receitas }) {
  const navigate = useNavigate();

  return (
    <div className="receita-lista">
      {receitas.map((r) => (
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
          <button className="btn-ver" onClick={() => navigate(`/receita/${r.id || r.id_conteudo}`)}>Ver</button>
        </div>
      ))}
    </div>
  );
}

export default Favoritas;
