import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topo from '../components/Topo';
import '../styles/style.css';

function ReceitaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [receita, setReceita] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const idUsuario = user?.id;
  const isModerador = user?.role === 'admin';

  useEffect(() => {
    axios.get(`http://localhost:5000/api/conteudos/${id}`)
      .then(res => setReceita(res.data))
      .catch(err => console.error('Erro ao buscar receita:', err));
  }, [id]);

  const atualizarStatus = async (status) => {
    try {
      await axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status });
      navigate('/moderacao');
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  if (!receita) return <div>Carregando receita...</div>;

  const dataFormatada = new Date(receita.data_publicacao).toLocaleDateString('pt-BR');

  return (
    <div className="receita-detalhe-container">
      <Topo centralizado comMenu/>
      {menuAberto && (
        <div className="menu-lateral">
          <button onClick={() => navigate('/')}>Início</button>
          <button onClick={() => localStorage.clear() || navigate('/')}>Sair</button>
        </div>
      )}


      <div style={{ marginTop: '0px' }}>
        <h1 className="receita-titulo" style={{ marginTop: '5%' }}>
          {receita.nomePlanta}
        </h1>
      </div>

      {receita.imagens?.length > 0 ? (
        <img
          src={`http://localhost:5000${receita.imagens[0]}`}
          alt={receita.nomePlanta}
          className="receita-imagem-grande"
        />
      ) : (
        <img
          src="http://localhost:5000/uploads/no-image.png"
          alt="Sem imagem"
          className="receita-imagem-grande"
        />
      )}

      <div className="receita-info">
        <table>
          <tbody>
            <tr>
              <td><img src="/user.png" alt="Autor" width="30" /></td>
              <td><strong>Autor:</strong> {receita.autor || 'Anônimo'}</td>
            </tr>
            <tr>
              <td>📅</td>
              <td><strong>Publicada em:</strong> {dataFormatada}</td>
            </tr>
            <tr>
              <td colSpan={2}>
                <hr style={{ width: '100%', borderTop: '2px solid #2d6a4f' }} />
              </td>
            </tr>

            <tr>
              <td><img src={`/categoria/${receita.id_categoria}.png`} alt="Categoria" width="30" /></td>
              <td><strong>Categoria:</strong> {receita.categoria}</td>
            </tr>
            <tr>
              <td><img src={`/estacao/${receita.id_epoca}.png`} alt="Época" width="30" /></td>
              <td><strong>Época de plantio:</strong> {receita.epoca}</td>
            </tr>
            <tr>
              <td>
                <img
                  src={Number(receita.temperatura) < 20 ? '/frio.png' : '/quente.png'}
                  alt="Temperatura"
                  width="30"
                />
              </td>
              <td><strong>Temperatura ideal:</strong> {receita.temperatura}°C</td>
            </tr>
            <tr>
              <td><img src={`/solo/${receita.id_solo}.png`} alt="Solo" width="30" /></td>
              <td><strong>Solo:</strong> {receita.solo}</td>
            </tr>
            <tr>
              <td>
                <img
                  src={
                    receita.rega?.toLowerCase().includes('dia') ? '/gota/3.png' :
                      receita.rega?.toLowerCase().includes('semana') ? '/gota/2.png' :
                        receita.rega?.toLowerCase().includes('mês') || receita.rega?.toLowerCase().includes('mes') ? '/gota/1.png' :
                          '/gota/1.png'
                  }
                  alt="Frequência de rega"
                  width="30"
                />
              </td>
              <td><strong>Frequência de rega:</strong> {receita.rega}</td>
            </tr>
            <tr>
              <td><img src={`/sol/${receita.id_sol}.png`} alt="Sol" width="30" /></td>
              <td><strong>Exposição ao sol:</strong> {receita.sol}</td>
            </tr>
            <tr>
              <td>📋</td>
              <td><strong>Instruções detalhadas:</strong></td>
            </tr>
          </tbody>
        </table>

        <div style={{ backgroundColor: '#f1f1f1', padding: '1rem', borderRadius: '10px', marginTop: '10px' }}>
          <p>{receita.instrucoes}</p>
        </div>
      </div>

      <div className="botoes-aprovacao">
        <button className="btn-voltar-especial" onClick={() => navigate(-1)}>← Voltar</button>

        {isModerador && (
          <>
            {receita.status !== 'aprovado' && (
              <button className="btn-aprovar" onClick={() => atualizarStatus('aprovado')}>✅ Aprovar</button>
            )}
            {receita.status === 'aprovado' ? (
              <button className="btn-rejeitar" onClick={() => atualizarStatus('rejeitado')}>❌ Excluir</button>
            ) : (
              <button className="btn-rejeitar" onClick={() => atualizarStatus('rejeitado')}>❌ Rejeitar</button>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default ReceitaDetalhe;
