import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BotaoAcao from "./BotaoAcao";

function Moderacao() {
  const [receitas, setReceitas] = useState([]);
  const navigate = useNavigate();

  const styles = {
    moderacaoContainer: {
      padding: '20px',
      backgroundColor: '#f0f4f7',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
    moderacaoHeader: {
      textAlign: 'center',
      marginBottom: '30px',
      paddingTop: '20px',
    },
    tituloModeracao: {
      fontSize: '1.8rem',
      fontWeight: 700,
      color: '#3a414b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      margin: '0',
    },
    tituloIcon: {
      width: '30px',
      height: '30px',
    },
    receitaListaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      justifyContent: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    receitaCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '400px',
    },
    receitaImagemContainer: {
      width: '100%',
      height: '180px',
      overflow: 'hidden',
      backgroundColor: '#2d6a4f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      flexDirection: 'column',
      color: '#fff',
      fontWeight: 600,
      textAlign: 'center',
    },
    receitaImagem: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    noImageIcon: {
      width: '40px',
      height: '40px',
      marginBottom: '10px',
    },
    receitaInfo: {
      padding: '15px',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    receitaId: {
      fontSize: '0.85rem',
      color: '#a0a0a0',
      marginBottom: '5px',
    },
    receitaNome: {
      fontSize: '1.1rem',
      fontWeight: 700,
      color: '#333',
      margin: '0 0 10px 0',
      lineHeight: '1.3',
    },
    receitaAutor: {
      fontSize: '0.9rem',
      color: '#666',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0 0 8px 0',
    },
    receitaStatus: {
      fontSize: '0.9rem',
      color: '#666',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0 0 15px 0',
    },
    infoIcon: {
      width: '16px',
      height: '16px',
    },
    botoesModeracaoContainer: {
      padding: '0 15px 15px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      justifyContent: 'center',
      marginTop: 'auto',
    },
    emptyStateContainer: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      padding: '40px 20px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '80px auto',
    },
    emptyStateIconWrapper: {
      width: '80px',
      height: '80px',
      margin: '0 auto 20px',
      border: '4px solid #b0c9b0',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateIcon: {
      width: '50px',
      height: '50px',
    },
    emptyStateTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#4a4a4a',
      marginBottom: '10px',
    },
    emptyStateText: {
      fontSize: '1rem',
      color: '#777',
      maxWidth: '400px',
      margin: '0 auto',
    },
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/conteudos/pendentes")
      .then((res) => {
        const fetchedReceitas = res.data;
        // 🚨 Alteração aqui: removido o .slice(0, 4) para exibir todas as receitas
        setReceitas(fetchedReceitas); 
      })
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
      setReceitas((prev) => prev.filter((r) => (r.id || r.id_conteudo) !== id));
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
      setReceitas((prev) => prev.filter((r) => (r.id || r.id_conteudo) !== id));
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
    <div style={styles.moderacaoContainer}>
      <div style={styles.moderacaoHeader}>
        <h2 style={styles.tituloModeracao}>
          <img src="/list.png" alt="Ícone de lista" style={styles.tituloIcon} />
          Receitas pendentes de moderação
        </h2>
      </div>

      {receitas.length === 0 ? (
        <div style={styles.emptyStateContainer}>
          <div style={styles.emptyStateIconWrapper}>
            <img src="/interrogacao.png" alt="Ícone de exclamação" style={styles.emptyStateIcon} />
          </div>
          <h3 style={styles.emptyStateTitle}>Nenhuma receita pendente</h3>
          <p style={styles.emptyStateText}>
            Todas as receitas foram revisadas. Quando novos conteúdos forem enviados, eles
            aparecerão aqui para moderação.
          </p>
        </div>
      ) : (
        <div style={styles.receitaListaGrid}>
          {receitas.map((r) => {
            const idReceita = r.id || r.id_conteudo;
            const imagemSrc = r.imagens?.[0] ? `http://localhost:5000${r.imagens[0]}` : null;

            return (
              <div key={idReceita} style={styles.receitaCard}>
                <div style={styles.receitaImagemContainer}>
                  {imagemSrc ? (
                    <img src={imagemSrc} alt={r.nomePlanta} style={styles.receitaImagem} />
                  ) : (
                    <>
                      <img src="/interrogacao.png" alt="Sem imagem" style={styles.noImageIcon} />
                      <p>Sem Imagem</p>
                    </>
                  )}
                </div>
                <div style={styles.receitaInfo}>
                  <div style={styles.receitaId}>ID: {idReceita}</div>
                  <h3 style={styles.receitaNome}>{r.nomePlanta || 'Sem Título'}</h3>
                  <p style={styles.receitaAutor}>
                    <img src="/user.png" alt="Ícone de usuário" style={styles.infoIcon} />
                    {r.autor || "Anônimo"}
                  </p>
                  <p style={styles.receitaStatus}>
                    <img src="/hourglass.png" alt="Ícone de relógio de areia" style={styles.infoIcon} />
                    Aguardando moderação
                  </p>
                </div>
                <div style={styles.botoesModeracaoContainer}>
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Moderacao;