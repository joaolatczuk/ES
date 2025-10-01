import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import BotaoAcao from "./BotaoAcao";

function Enviadas({ receitas, setReceitas }) {
  const navigate = useNavigate();

  const styles = {
    enviadasContainer: {
      padding: "20px",
      backgroundColor: "#f3f6f9",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    receitaListaGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "20px",
      justifyContent: "center",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    receitaCard: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: "400px",
    },
    receitaImagemContainer: {
      width: "100%",
      height: "180px",
      overflow: "hidden",
      backgroundColor: "#2d6a4f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      flexDirection: "column",
      color: "#fff",
      fontWeight: 600,
      textAlign: "center",
    },
    receitaImagem: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    noImageIcon: {
      width: "40px",
      height: "40px",
      marginBottom: "10px",
    },
    receitaInfo: {
      padding: "15px",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
    },
    receitaId: {
      fontSize: "0.85rem",
      color: "#a0a0a0",
      marginBottom: "5px",
    },
    receitaNome: {
      fontSize: "1.1rem",
      fontWeight: 700,
      color: "#333",
      margin: "0 0 10px 0",
      lineHeight: "1.3",
    },
    receitaStatus: {
      fontSize: "0.9rem",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      margin: "0 0 15px 0",
    },
    statusPendente: {
      color: "#666",
    },
    statusAprovado: {
      color: "green",
    },
    infoIcon: {
      width: "16px",
      height: "16px",
    },
    botoesContainer: {
      padding: "0 15px 15px",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      justifyContent: "center",
      marginTop: "auto",
    },
    mensagemVazia: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      padding: "40px 20px",
      textAlign: "center",
      maxWidth: "600px",
      margin: "80px auto",
      fontSize: "1.2rem",
      color: "#777",
    },
  };

  const excluirReceita = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/excluir`);
      setReceitas((prev) => prev.filter((r) => (r.id || r.id_conteudo) !== id));
      Swal.fire({
        icon: "success",
        title: "Excluído!",
        text: "A receita foi excluída com sucesso.",
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

  const receitasEnviadas = (receitas || []).filter((r) => r.statusAtivo === 1);

  return (
    <div style={styles.enviadasContainer}>
      {receitasEnviadas.length === 0 ? (
        <div style={styles.mensagemVazia}>
          Nenhuma receita enviada encontrada.
        </div>
      ) : (
        <div style={styles.receitaListaGrid}>
          {receitasEnviadas.map((r) => {
            const id = r.id || r.id_conteudo;
            const imagemSrc = r.imagens?.[0]
              ? `http://localhost:5000${r.imagens[0]}`
              : null;

            return (
              <div key={id} style={styles.receitaCard}>
                <div style={styles.receitaImagemContainer}>
                  {imagemSrc ? (
                    <img
                      src={imagemSrc}
                      alt={r.nomePlanta}
                      style={styles.receitaImagem}
                    />
                  ) : (
                    <>
                      <img
                        src="/interrogacao.png"
                        alt="Sem imagem"
                        style={styles.noImageIcon}
                      />
                      <p>Sem Imagem</p>
                    </>
                  )}
                </div>

                <div style={styles.receitaInfo}>
                  <div style={styles.receitaId}>ID: {id}</div>
                  <h3 style={styles.receitaNome}>{r.nomePlanta}</h3>

                  {r.status === "pendente" && (
                    <p style={{ ...styles.receitaStatus, ...styles.statusPendente }}>
                      <img
                        src="/hourglass.png"
                        alt="Ícone de relógio de areia"
                        style={styles.infoIcon}
                      />
                      Aguardando moderação
                    </p>
                  )}

                  {r.status === "aprovado" && (
                    <p style={{ ...styles.receitaStatus, ...styles.statusAprovado }}>
                      <img
                        src="/check.png"
                        alt="Ícone de aprovado"
                        style={styles.infoIcon}
                      />
                      Aprovado
                    </p>
                  )}
                </div>

                <div style={styles.botoesContainer}>
                  {r.status === "pendente" && (
                    <BotaoAcao
                      label="Excluir"
                      tipo="excluir"
                      onClick={() => excluirReceita(id)}
                    />
                  )}

                  {r.status === "aprovado" && (
                    <>
                      <BotaoAcao
                        label="Ver"
                        tipo="ver"
                        onClick={() => navigate(`/receita/${id}`)}
                      />
                      <BotaoAcao
                        label="Excluir"
                        tipo="excluir"
                        onClick={() => excluirReceita(id)}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Enviadas;
