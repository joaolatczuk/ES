import React from 'react';
import { Link } from 'react-router-dom';

export default function ContaBloqueada() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>Conta Bloqueada</h2>
        <p style={styles.msg}>
          Sua conta está bloqueada. Entre em contato com o administrador para solicitar a liberação.
        </p>

        <div style={styles.actions}>
          <a href="mailto:joao.latczuk@fatecourinhos.sp.gov" style={styles.linkButton}>Falar com o administrador</a>
          <Link to="/" style={styles.textLink}>Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f5' },
  card: { width: 480, padding: 30, borderRadius: 8, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', textAlign: 'center' },
  logo: { width: 80, marginBottom: 12 },
  title: { color: '#2d6a4f', marginBottom: 8 },
  msg: { color: '#444', marginBottom: 18 },
  actions: { display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' },
  linkButton: { padding: '10px 16px', background: '#2d6a4f', color: '#fff', textDecoration: 'none', borderRadius: 6 },
  textLink: { color: '#2d6a4f', textDecoration: 'none' }
};
