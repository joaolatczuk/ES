import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Topo from '../components/Topo';
import BotaoAcao from '../components/BotaoAcao';
import '../styles/style.css';

function ReceitaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receita, setReceita] = useState(null);
  const [favoritado, setFavoritado] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const idUsuario = user?.id;
  const isModerador = user?.role === 'admin';

  useEffect(() => {
    axios.get(`http://localhost:5000/api/conteudos/${id}`)
      .then(res => setReceita(res.data))
      .catch(err => console.error('Erro ao buscar receita:', err));
  }, [id]);

  useEffect(() => {
    if (idUsuario) {
      axios.get(`http://localhost:5000/api/favoritos/${idUsuario}/${id}`)
        .then(res => {
          const favorito = res.data;
          setFavoritado(favorito?.statusAtivo === 1);
        })
        .catch(err => console.error('Erro ao verificar favorito:', err));
    }
  }, [id, idUsuario]);

  const toggleFavorito = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/favoritos/${idUsuario}/${id}`);
      const favorito = response.data;

      if (!favorito) {
        await axios.post(`http://localhost:5000/api/favoritos`, {
          id_usuario: idUsuario,
          id_conteudo: id,
          statusAtivo: 1
        });
        setFavoritado(true);
      } else {
        if (favorito.statusAtivo === 1) {
          await axios.put(`http://localhost:5000/api/favoritos/remover`, {
            id_usuario: idUsuario,
            id_conteudo: id
          });
          setFavoritado(false);
        } else {
          await axios.post(`http://localhost:5000/api/favoritos`, {
            id_usuario: idUsuario,
            id_conteudo: id,
            statusAtivo: 1
          });
          setFavoritado(true);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err);
    }
  };

  const atualizarStatus = async (status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });

      Swal.fire({
        icon: 'success',
        title: `Receita ${status === 'aprovado' ? 'aprovada' : 'rejeitada'} com sucesso!`,
        showConfirmButton: false,
        timer: 1500
      });

      setTimeout(() => {
        navigate('/conteudo');
      }, 1600);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar status',
        text: 'Tente novamente mais tarde.'
      });
    }
  };

  if (!receita) return <div>Carregando receita...</div>;

  const dataFormatada = new Date(receita.data_publicacao).toLocaleDateString('pt-BR');

  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 🔝 Topo fixo */}
      <div style={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <Topo centralizado comMenu />
      </div>

      {/* 📌 Card centralizado */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '40px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          fontFamily: 'sans-serif'
        }}>
          {/* Top Header Section */}
          <div style={{
            position: 'relative',
            backgroundColor: '#2d6a4f',
            padding: '20px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px 16px 0 0'
          }}>
            {/* Favorite Button */}
            <div
              onClick={toggleFavorito}
              title={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <img
                src={favoritado ? '/heart.png' : '/broken-heart.png'}
                alt="Favorito"
                width="40"
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: '20px'
            }}>
              {/* Plant Image */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2d6a4f',
                color: '#fff',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {receita.imagens?.[0] ? (
                  <img
                    src={receita.imagens[0]}
                    alt={receita.nomePlanta}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <img src="/interrogacao.png" alt="Sem imagem" style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
                    <p style={{ fontSize: '12px' }}>Sem Imagem</p>
                  </>
                )}
              </div>

              {/* Title and Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                <div style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>{receita.nomePlanta}</div>

                {/* Autor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/user.png" alt="Autor" width="20" height="20" />
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Autor:</span>
                  <span style={{ fontSize: '16px' }}>{receita.autor}</span>
                </div>

                {/* Publicada em */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/calendar.png" alt="Data de publicação" width="20" height="20" />
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Publicada em:</span>
                  <span style={{ fontSize: '16px' }}>{dataFormatada}</span>
                </div>

                {/* Categoria (agora do backend) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {receita.categoria_icon && (
                    <img src={receita.categoria_icon} alt="Categoria" width="20" height="20" />
                  )}
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Categoria:</span>
                  <span style={{ fontSize: '16px' }}>{receita.categoria}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            padding: '20px'
          }}>
            {/* Cultivation Conditions */}
            <div style={{
              backgroundColor: '#f0fff0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '20px', margin: '0 0 15px 0', color: '#4d985a' }}>
                <span style={{ marginRight: '10px' }}>🌱</span>
                Condições de Cultivo
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Época (do backend) */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '10px',
                  borderRadius: '8px', border: '1px solid #e0e0e0'
                }}>
                  {receita.epoca_icon && <img src={receita.epoca_icon} alt="Época" width="30" />}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Época de plantio</span>
                    <span style={{ fontSize: '16px' }}>{receita.epoca}</span>
                  </div>
                </div>

                {/* Temperatura */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '10px',
                  borderRadius: '8px', border: '1px solid #e0e0e0'
                }}>
                  <img src={Number(receita.temperatura) < 20 ? '/frio.png' : '/quente.png'} alt="Temperatura" width="30" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Temperatura ideal</span>
                    <span style={{ fontSize: '16px' }}>{receita.temperatura}°C</span>
                  </div>
                </div>

                {/* Solo (do backend) */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '10px',
                  borderRadius: '8px', border: '1px solid #e0e0e0'
                }}>
                  {receita.solo_icon && <img src={receita.solo_icon} alt="Solo" width="30" />}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Solo</span>
                    <span style={{ fontSize: '16px' }}>{receita.solo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Care Section */}
            <div style={{
              backgroundColor: '#f0fff0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '20px', margin: '0 0 15px 0', color: '#4d985a' }}>
                <span style={{ marginRight: '10px' }}>💧</span>
                Cuidados
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Rega */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '10px',
                  borderRadius: '8px', border: '1px solid #e0e0e0'
                }}>
                  <img src={receita.rega?.toLowerCase().includes('dia') ? '/gota/3.png' : receita.rega?.toLowerCase().includes('semana') ? '/gota/2.png' : '/gota/1.png'} alt="Frequência de rega" width="30" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Frequência de rega</span>
                    <span style={{ fontSize: '16px' }}>{receita.rega}</span>
                  </div>
                </div>

                {/* Sol (do backend) */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '10px',
                  borderRadius: '8px', border: '1px solid #e0e0e0'
                }}>
                  {receita.sol_icon && <img src={receita.sol_icon} alt="Sol" width="30" />}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Exposição ao sol</span>
                    <span style={{ fontSize: '16px' }}>{receita.sol}</span>
                  </div>
                </div>

                {/* Instruções */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '10px',
                  borderRadius: '8px', border: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '24px' }}>📋</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Instruções detalhadas</span>
                    <span style={{ fontSize: '16px', whiteSpace: 'pre-line' }}>
                      {receita.instrucoes}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            padding: '20px',
            borderTop: '1px solid #eee',
          }}>
            <BotaoAcao
              label="Voltar"
              tipo="padrao"
              onClick={() => navigate('/conteudo')}
              style={{ backgroundColor: '#2e66f3' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceitaDetalhe;
