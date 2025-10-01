import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BotaoAcao from './BotaoAcao';
import Filtro from './FiltroEnviadas';

function Publicadas({ receitas }) {
  const navigate = useNavigate();

  const [filtros, setFiltros] = useState({
    status: '',
    id_categoria: '',
    id_epoca: '',
    id_solo: '',
    id_sol: ''
  });

  const aplicarFiltros = (f) => {
    setFiltros(f);
  };

  const receitasAprovadas = (receitas || []).filter(r => r.status === 'aprovado');

  const receitasFiltradas = receitasAprovadas.filter(r => {
    const filtroCategoria = filtros.id_categoria ? r.id_categoria == filtros.id_categoria : true;
    const filtroEpoca = filtros.id_epoca ? r.id_epoca == filtros.id_epoca : true;
    const filtroSolo = filtros.id_solo ? r.id_solo == filtros.id_solo : true;
    const filtroSol = filtros.id_sol ? r.id_sol == filtros.id_sol : true;

    return filtroCategoria && filtroEpoca && filtroSolo && filtroSol;
  });

  const styles = {
    container: {
      display: 'flex',
      gap: '20px',
      padding: '20px',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f4f7',
      width: '85%',
      margin: '0 auto',
    },
    filtrosCol: {
      flexShrink: 0,
      width: '280px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      height: 'fit-content',
      position: 'sticky',
      top: '20px',
    },
    conteudo: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
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
    receitaData: {
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

  return (
    <div style={styles.container}>
      {/* Coluna de Filtros */}
      <div style={styles.filtrosCol}>
        <Filtro onFiltrar={aplicarFiltros} />
      </div>

      {/* Conteúdo (lista de cards) */}
      <div style={styles.conteudo}>
        <div style={styles.receitaListaGrid}>
          {receitasFiltradas.length === 0 ? (
            <div style={styles.emptyStateContainer}>
              <div style={styles.emptyStateIconWrapper}>
                <img src="/interrogacao.png" alt="Ícone vazio" style={styles.emptyStateIcon} />
              </div>
              <h3 style={styles.emptyStateTitle}>Nenhuma receita publicada ainda</h3>
              <p style={styles.emptyStateText}>
                Receitas aprovadas aparecerão aqui para o público em geral.
              </p>
            </div>
          ) : (
            receitasFiltradas.map(r => {
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
                    <h3 style={styles.receitaNome}>{r.nomePlanta || 'Sem Título'}</h3>
                    <p style={styles.receitaAutor}>
                      <img src="/user.png" alt="Ícone de usuário" style={styles.infoIcon} />
                      {r.autor || 'Anônimo'}
                    </p>
                    <p style={styles.receitaData}>
                      <img src="/calendar.png" alt="Ícone de calendário" style={styles.infoIcon} />
                      Publicado em: {new Date(r.data_publicacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div style={styles.botoesModeracaoContainer}>
                    <BotaoAcao
                      label="Ver"
                      tipo="ver"
                      onClick={() => navigate(`/receita/${idReceita}`)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Publicadas;
