import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Favoritas() {
  const [favoritos, setFavoritos] = useState([]);

  // Obtém o usuário do localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const idUsuario = user?.id;

  // Carrega os favoritos do usuário
  useEffect(() => {
    if (!idUsuario) return;

    carregarFavoritos();
  }, [idUsuario]);

  const carregarFavoritos = () => {
    axios.get(`http://localhost:5000/api/favoritos/${idUsuario}`)
      .then(res => setFavoritos(res.data))
      .catch(err => console.error('Erro ao carregar favoritos:', err));
  };

  const removerFavorito = async (id_conteudo) => {
    try {
      await axios.put('http://localhost:5000/api/favoritos/remover', {
        id_usuario: idUsuario,
        id_conteudo
      });
      carregarFavoritos(); // Atualiza após remover
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
    }
  };

  if (favoritos.length === 0) {
    return <p className="mensagem-vazia">Você ainda não favoritou nenhuma receita.</p>;
  }

  return (
    <div className="receita-lista">
      {favoritos.map(r => (
        <div key={r.id} className="receita-card simples">
          <img
            src={
              r.imagens
                ? `http://localhost:5000${r.imagens.split(',')[0]}`
                : 'http://localhost:5000/uploads/no-image.png'
            }
            alt={r.nomePlanta}
          />
          <h3>{r.nomePlanta}</h3>
          <p><strong>Autor:</strong> {r.autor || 'Anônimo'}</p>

          <button className="btn-ver" onClick={() => window.location.href = `/receita/${r.id}`}>
            Ver receita
          </button>

          <button className="btn-remover" onClick={() => removerFavorito(r.id)}>
            Remover dos favoritos
          </button>
        </div>
      ))}
    </div>
  );
}

export default Favoritas;