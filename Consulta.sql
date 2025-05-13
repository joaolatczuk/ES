
CREATE DATABASE IF NOT EXISTS agroplanner;
USE agroplanner;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('usuario', 'admin') DEFAULT 'usuario',
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  mensagem TEXT NOT NULL,
  visualizado BOOLEAN DEFAULT FALSE,
  data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de conteúdos (receitas de plantio)
CREATE TABLE IF NOT EXISTS conteudos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomePlanta VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  epoca VARCHAR(50) NOT NULL,
  temperatura VARCHAR(20),
  solo TEXT,
  rega VARCHAR(50),
  sol VARCHAR(50),
  instrucoes TEXT NOT NULL,
  id_autor INT NOT NULL,
  data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pendente',
  favorita BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_autor) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de favoritos (receitas marcadas por usuários)
CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_conteudo INT NOT NULL,
  data_adicionado DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_conteudo) REFERENCES conteudos(id) ON DELETE CASCADE,
  UNIQUE KEY (id_usuario, id_conteudo)
);
