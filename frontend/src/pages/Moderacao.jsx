import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/style.css';
import Topo from '../components/Topo';

function Moderacao() {
  const [pendentes, setPendentes] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate(); // ← IMPORTANTE

  useEffect(() => {
    axios.get('http://localhost:5000/api/conteudos/pendentes')
      .then(res => setPendentes(res.data))
      .catch(err => console.error('Erro ao buscar receitas pendentes:', err));
  }, []);

  const atualizarStatus = (id, status) => {
    axios.put(`http://localhost:5000/api/conteudos/${id}/status`, { status })
      .then(() => {
        setPendentes(pendentes.filter(r => r.id !== id));
      })
      .catch(err => console.error('Erro ao atualizar status:', err));
  };

  const sair = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="moderacao-container">
  
      <Topo centralizado comMenu onMenuClick={() => setMenuAberto(!menuAberto)} />
  
      {menuAberto && (
        <div className="menu-lateral">
          <button onClick={sair}>Sair</button>
        </div>
      )}
  
      {/* Conteúdo centralizado */}
      <div className="conteudo-centralizado">
        <button
          className="botao-voltar"
          onClick={() => navigate('/conteudo')}
        >
          ← Voltar
        </button>
  
        <h2>Moderação de Receitas</h2>
  
        {pendentes.length === 0 ? (
          <p>Não há receitas pendentes no momento.</p>
        ) : (
          pendentes.map(receita => (
            <div key={receita.id} className="receita-card">
              <h3>{receita.nomePlanta}</h3>
              <p><strong>Categoria:</strong> {receita.categoria}</p>
              <p><strong>Época:</strong> {receita.epoca}</p>
              <p><strong>Instruções:</strong> {receita.instrucoes}</p>
  
              {receita.imagens && receita.imagens.length > 0 && (
                <div className="imagens-container">
                  {receita.imagens.map((url, i) => (
                    <img key={i} src={`http://localhost:5000${url}`} alt="Imagem da planta" className="imagem-receita" />
                  ))}
                </div>
              )}
  
              <div className="botoes-aprovacao">
                <button onClick={() => atualizarStatus(receita.id, 'aprovado')} className="btn-aprovar">Aprovar</button>
                <button onClick={() => atualizarStatus(receita.id, 'rejeitado')} className="btn-rejeitar">Rejeitar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );  
}

export default Moderacao;