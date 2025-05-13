import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cadastro from './Cadastro';
import Login from './Login';
import Home from './Home';
import Forum from './Forum';
import Calendario from './Calendario';
import Conteudo from './Conteudo';
import PrivateRoute from './PrivateRoute';
import Moderacao from './Moderacao';
import ReceitaDetalhe from './ReceitaDetalhe';


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
        <Route path="/moderacao" element={
          <PrivateRoute><Moderacao /></PrivateRoute>
        } />
        <Route path="/receita/:id" element={
          <PrivateRoute><ReceitaDetalhe /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;