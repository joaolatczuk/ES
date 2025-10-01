import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import BotaoAcao from "./BotaoAcao";

function Favoritas() {
  const [favoritos, setFavoritos] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const idUsuario = user?.id;

  useEffect(() => {
    if (!idUsuario) return;
    carregarFavoritos();
  }, [idUsuario]);

  const carregarFavoritos = () => {
    axios
      .get(`http://localhost:5000/api/favoritos/${idUsuario}`)
      .then((res) => setFavoritos(res.data))
      .catch((err) => console.error("Erro ao carregar favoritos:", err));
  };

  const removerFavorito = async (id_conteudo) => {
    try {
      await axios.put("http://localhost:5000/api/favoritos/remover", {
        id_usuario: idUsuario,
        id_conteudo,
      });
      setFavoritos((prev) => prev.filter((r) => (r.id || r.id_conteudo) !== id_conteudo));
      Swal.fire({
        icon: "success",
        title: "Removido!",
        text: "A receita foi removida dos favoritos.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Não foi possível remover dos favoritos.",
      });
    }
  };

  const favoritosAtivos = (favoritos || []).filter((r) => r.statusAtivo === 1);

  if (favoritosAtivos.length === 0) {
    return (
      <div className="empty-state">
        Você ainda não favoritou nenhuma receita.
        <style>{css}</style>
      </div>
    );
  }

  return (
    <div className="favoritas-container">
      <div className="grid">
        {favoritosAtivos.map((r) => {
          const id = r.id || r.id_conteudo;
          const imagemSrc = r.imagens
            ? `http://localhost:5000${r.imagens.split(",")[0]}`
            : "/interrogacao.png";

          return (
            <div key={id} className="card">
              {/* Imagem */}
              <div className="imagem-wrapper">
                {imagemSrc && imagemSrc !== "/interrogacao.png" ? (
                  <img src={imagemSrc} alt={r.nomePlanta} />
                ) : (
                  <>
                    <img src="/interrogacao.png" alt="Sem imagem" className="placeholder" />
                    <p>Sem Imagem</p>
                  </>
                )}
              </div>

              {/* Conteúdo */}
              <div className="conteudo">
                <div className="id">ID: {id}</div>
                <h3>{r.nomePlanta}</h3>
                <p>
                  <span>Autor:</span> {r.autor || "Anônimo"}
                </p>
              </div>

              {/* Botões */}
              <div className="botoes">
                <BotaoAcao
                  label="Ver"
                  tipo="ver"
                  onClick={() => (window.location.href = `/receita/${id}`)}
                />
                <BotaoAcao
                  label="Remover"
                  tipo="remover"
                  onClick={() => removerFavorito(id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS direto no arquivo */}
      <style>{css}</style>
    </div>
  );
}

const css = `
.favoritas-container {
  padding: 20px;
  background-color: #f3f6f9;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.imagem-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background-color: #2d6a4f;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-direction: column;
  color: #fff;
  font-weight: 600;
  text-align: center;
}

.imagem-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagem-wrapper .placeholder {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
}

.conteudo {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.conteudo .id {
  font-size: 0.85rem;
  color: #a0a0a0;
  margin-bottom: 5px;
}

.conteudo h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
}

.conteudo p {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 15px;
}

.conteudo p span {
  font-weight: 600;
}

.botoes {
  padding: 0 15px 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: auto;
}

.empty-state {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 40px 20px;
  text-align: center;
  max-width: 600px;
  margin: 80px auto;
  font-size: 1.2rem;
  color: #777;
}

/* Botões de filtro */
.filtro-enviadas-container {
  width: 230px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  font-family: Arial, sans-serif;
}

.filtro-enviadas-container h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.filtro-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.filtro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  user-select: none;
}

.filtro-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #555;
}

.filtro-header span {
  font-size: 1.2rem;
  color: #888;
}

.filtro-opcoes {
  display: flex;
  flex-direction: column;
  padding-left: 10px;
  padding-top: 10px;
}

.filtro-opcoes .radio-label {
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #666;
}

.filtro-opcoes input[type="radio"] {
  margin-right: 8px;
}

.botoes-filtro {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.botoes-filtro button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.aplicar-btn {
  background-color: #2d6a4f;
  color: white;
}

.limpar-btn {
  background-color: #ccc;
  color: #333;
}

/* Botão de remover vermelho */
button.remover {
  background-color: #f44336 !important;
  color: #fff !important;
}
`;

export default Favoritas;
