import React from 'react';
import { Link } from 'react-router-dom';

const AcessoNegado = () => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f7f8' }}>
    <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 6px 20px rgba(0,0,0,.08)' }}>
      <h2 style={{ marginTop: 0, color: '#b71c1c' }}>Acesso negado</h2>
      <p>Você não possui permissão para acessar esta página.</p>
      <Link to="/home" style={{ color: '#2d6a4f', fontWeight: 700 }}>Voltar para a Home</Link>
    </div>
  </div>
);

export default AcessoNegado;