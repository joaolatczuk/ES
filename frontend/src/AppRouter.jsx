import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Home from './pages/Home';
import Forum from './pages/Forum';
import Calendario from './pages/Calendario';
import Conteudo from './pages/Conteudo';
import PrivateRoute from './components/PrivateRoute';
import ReceitaDetalhe from './pages/ReceitaDetalhe';
import Moderacao from './components/Moderacao';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* ROTAS PROTEGIDAS */}
        <Route path="/home" element={
          <PrivateRoute><Home /></PrivateRoute>
        } />
        <Route path="/forum" element={
          <PrivateRoute><Forum /></PrivateRoute>
        } />
        <Route path="/calendario" element={
          <PrivateRoute><Calendario /></PrivateRoute>
        } />
        <Route path="/conteudo" element={
          <PrivateRoute><Conteudo /></PrivateRoute>
        } />
        <Route path="/receita/:id" element={
          <PrivateRoute><ReceitaDetalhe /></PrivateRoute>
        } />
        <Route path="/moderacao" element={
          <PrivateRoute><Moderacao /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;