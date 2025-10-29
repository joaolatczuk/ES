import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Home from './pages/Home';
import Calendario from './pages/Calendario';
import Conteudo from './pages/Conteudo';
import ReceitaDetalhe from './pages/ReceitaDetalhe';
import Perfil from './pages/Perfil';
import Moderacao from './components/Moderacao';
import PrivateRoute from './components/PrivateRoute';
import AdminUsuarios from './pages/AdminUsuarios';
import AcessoNegado from './components/AcessoNegado';
import ContaBloqueada from './pages/ContaBloqueada';
import ModeracaoAdicionar from './pages/ModeracaoAdicionar';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Autenticadas */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/calendario" element={<PrivateRoute><Calendario /></PrivateRoute>} />
        <Route path="/conteudo" element={<PrivateRoute><Conteudo /></PrivateRoute>} />
        <Route path="/receita/:id" element={<PrivateRoute><ReceitaDetalhe /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

        {/* Apenas admin */}
        <Route path="/moderacao" element={<PrivateRoute role="admin"><Moderacao /></PrivateRoute>} />
        <Route path="/admin/usuarios" element={<PrivateRoute role="admin"><AdminUsuarios /></PrivateRoute>} />
        <Route path="/moderacaoadicionar" element={<PrivateRoute role="admin"><ModeracaoAdicionar /></PrivateRoute>} />

        {/* Fallback de permissão */}
        <Route path="/acesso-negado" element={<AcessoNegado />} />
        <Route path="/conta-bloqueada" element={<ContaBloqueada />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;