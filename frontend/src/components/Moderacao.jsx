import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BotaoAcao from "./BotaoAcao";

function Moderacao() {
  const [receitas, setReceitas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/conteudos/pendentes")
      .then((res) => setReceitas(res.data))
      .catch((err) => {
        console.error("Erro ao buscar receitas pendentes:", err);
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: "Não foi possível carregar as receitas pendentes.",
        });
      });
  }, []);

  const atualizarStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });

      setReceitas((prev) =>
        prev.map((r) =>
          (r.id || r.id_conteudo) === id ? { ...r, status } : r
        )
      );

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: `Status atualizado para "${status}" com sucesso!`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Não foi possível atualizar o status.",
      });
    }
  };

  const excluirReceita = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/excluir`);

      setReceitas((prev) =>
        prev.map((r) =>
          (r.id || r.id_conteudo) === id ? { ...r, status: "excluido" } : r
        )
      );

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Receita excluída com sucesso!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erro ao excluir receita:", err);
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Não foi possível excluir a receita.",
      });
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

            let cardClasses = "receita-card";
            if (r.status === "rejeitado") cardClasses += " bg-red-100";
            if (r.status === "excluido") cardClasses += " bg-red-300";

            return (
              <div key={idReceita} className={cardClasses}>
                <img
                  src={`http://localhost:5000${
                    r.imagens?.[0] || "/uploads/no-image.png"
                  }`}
                  alt={r.nomePlanta}
                  className="receita-imagem"
                />
                <h3>{r.nomePlanta}</h3>
                <p style={{ fontStyle: "italic" }}>👤 {r.autor || "Anônimo"}</p>

                <div className="status-info">
                  {r.status === "pendente" && (
                    <span style={{ color: "#999" }}>⏳ Aguardando moderação</span>
                  )}
                  {r.status === "aprovado" && (
                    <span style={{ color: "green" }}>✅ Aprovado</span>
                  )}
                  {r.status === "rejeitado" && (
                    <span style={{ color: "red" }}>❌ Rejeitado</span>
                  )}
                  {r.status === "excluido" && (
                    <span style={{ color: "darkred" }}>🗑️ Excluído</span>
                  )}
                </div>

                <div className="botoes-acao flex gap-2 flex-wrap">
                  {r.status === "pendente" && (
                    <>
                      <BotaoAcao
                        label="Ver"
                        tipo="ver"
                        onClick={() => navigate(`/receita/${idReceita}`)}
                      />
                      <BotaoAcao
                        label="Aprovar"
                        tipo="aprovar"
                        onClick={() => atualizarStatus(idReceita, "aprovado")}
                      />
                      <BotaoAcao
                        label="Rejeitar"
                        tipo="rejeitar"
                        onClick={() => atualizarStatus(idReceita, "rejeitado")}
                      />
                      <BotaoAcao
                        label="Excluir"
                        tipo="excluir"
                        onClick={() => excluirReceita(idReceita)}
                      />
                    </>
                  )}

                  {r.status === "aprovado" && (
                    <BotaoAcao
                      label="Ver"
                      tipo="ver"
                      onClick={() => navigate(`/receita/${idReceita}`)}
                    />
                  )}
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