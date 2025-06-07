import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/style.css';

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
        senha
      });

      setMensagem(resposta.data.message);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (erro) {
      setMensagem('Erro ao cadastrar. Verifique os campos.');
      console.error(erro);
    }
  };

  return (
    <div className="cadastro-container">
      <img src="/logo.png" alt="Logo AgroPlanner" className="logo" />
      <h2 className="titulo">AgroPlanner</h2>

      <div className="social-icons">
        <i className="fa-brands fa-instagram"></i>
        <i className="fa-brands fa-facebook"></i>
        <i className="fa-brands fa-google"></i>
      </div>

      <form className="formulario" onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome:</label>
        <input
          type="text"
          id="nome"
          placeholder="Digite seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label htmlFor="senha">Senha:</label>
        <input
          type="password"
          id="senha"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <label htmlFor="confirmarSenha">Digite novamente:</label>
        <input
          type="password"
          id="confirmarSenha"
          placeholder="Digite sua senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        <label htmlFor="email">Digite seu e-mail:</label>
        <input
          type="email"
          id="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Criar minha conta</button>
      </form>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <Link to="/" style={{ marginTop: '10px', color: '#2d6a4f' }}>
        Já tem conta?
      </Link>
    </div>
  );
}

export default Cadastro;
