// src/pages/Cadastro.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }

    try {
      const resposta = await axios.post('http://localhost:5000/api/users/register', {
        nome,
        email,
        senha,
      });

      setMensagem(resposta.data.message || 'Cadastro realizado com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (erro) {
      setMensagem('Erro ao cadastrar. Verifique os campos.');
      console.error(erro);
    }
  };

  return (
    <div style={styles.cadastroContainer}>
      <div style={styles.logoContainer}>
        <img src="/logo.png" alt="Logo AgroPlanner" style={styles.logo} />
        <h2 style={styles.titulo}>AgroPlanner</h2>
      </div>

      <div style={styles.formularioContainer}>
        <form style={styles.formulario} onSubmit={handleSubmit}>
          <label htmlFor="nome" style={styles.label}>Nome completo:</label>
          <input
            type="text"
            id="nome"
            placeholder="Digite seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={styles.input}
            required
          />

          <label htmlFor="email" style={styles.label}>E-mail:</label>
          <input
            type="email"
            id="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <label htmlFor="senha" style={styles.label}>Senha:</label>
          <input
            type="password"
            id="senha"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
            required
          />

          <label htmlFor="confirmarSenha" style={styles.label}>Confirme sua senha:</label>
          <input
            type="password"
            id="confirmarSenha"
            placeholder="Digite novamente sua senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>Criar minha conta</button>
        </form>

        {mensagem && <p style={styles.mensagem}>{mensagem}</p>}

        <Link to="/" style={styles.criarContaLink}>
          Já tem conta? Faça login
        </Link>
      </div>
    </div>
  );
}

const styles = {
  cadastroContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f1f1f1',
    fontFamily: 'Arial, sans-serif',
  },
  logoContainer: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    maxWidth: '100px',
    marginBottom: '10px',
  },
  titulo: {
    color: '#2d6a4f',
    marginBottom: '10px',
  },
  formularioContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  label: {
    marginBottom: '5px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '15px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    width: '100%',
  },
  mensagem: {
    marginTop: '15px',
    color: '#d62828',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  criarContaLink: {
    marginTop: '15px',
    color: '#2d6a4f',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default Cadastro;