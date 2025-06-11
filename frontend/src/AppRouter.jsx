import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Home from './pages/Home';
import Forum from './pages/Forum';
import Calendario from './pages/Calendario';
import Conteudo from './pages/Conteudo';
import ReceitaDetalhe from './pages/ReceitaDetalhe';
import Moderacao from './components/Moderacao';
import PrivateRoute from './components/PrivateRoute';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas protegidas para usuários autenticados */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />
        <Route path="/calendario" element={<PrivateRoute><Calendario /></PrivateRoute>} />
        <Route path="/conteudo" element={<PrivateRoute><Conteudo /></PrivateRoute>} />
        <Route path="/receita/:id" element={<PrivateRoute><ReceitaDetalhe /></PrivateRoute>} />

        {/* Rota protegida apenas para administradores */}
        <Route path="/moderacao" element={<PrivateRoute role="admin"><Moderacao /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
