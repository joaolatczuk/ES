import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  // Redireciona automaticamente se já estiver logado
  useEffect(() => {
    const logado = localStorage.getItem('usuarioLogado');
    if (logado === 'true') {
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await axios.post('http://localhost:5000/api/users/login', {
        email,
        senha
      });

      if (resposta.data.success) {
        const { id, nome, tipo } = resposta.data.usuario;
      
        localStorage.setItem('usuarioLogado', 'true');
        localStorage.setItem('user', JSON.stringify({
          id,
          nome,
          role: tipo
        }));
      
        setMensagem('Login realizado com sucesso!');
        navigate('/home');
      }
       else {
        setMensagem('Email ou senha incorretos.');
      }
    } catch (erro) {
      setMensagem('Erro ao conectar. Verifique o backend.');
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
        <label htmlFor="email">E-mail:</label>
        <input
          type="email"
          id="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="senha">Senha:</label>
        <input
          type="password"
          id="senha"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit">Fazer login</button>
      </form>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <Link to="/cadastro" style={{ marginTop: '10px', color: '#2d6a4f' }}>
        Criar conta
      </Link>
    </div>
  );
}

export default Login;