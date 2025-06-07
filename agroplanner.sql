-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para agroplanner
CREATE DATABASE IF NOT EXISTS `agroplanner` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `agroplanner`;

-- Copiando estrutura para tabela agroplanner.categoriaepoca
CREATE TABLE IF NOT EXISTS `categoriaepoca` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.categoriaepoca: ~7 rows (aproximadamente)
INSERT INTO `categoriaepoca` (`id`, `nome`) VALUES
	(1, 'Primavera'),
	(2, 'Verão'),
	(3, 'Outono'),
	(4, 'Inverno'),
	(5, 'Ano todo'),
	(6, 'Estação seca'),
	(7, 'Estação chuvosa');

-- Copiando estrutura para tabela agroplanner.categoriasol
CREATE TABLE IF NOT EXISTS `categoriasol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.categoriasol: ~6 rows (aproximadamente)
INSERT INTO `categoriasol` (`id`, `nome`) VALUES
	(1, 'Pleno sol – mínimo de 4h de sol direto'),
	(2, 'Meia sombra – algumas horas com luz direta'),
	(3, 'Sombra – luz indireta, sem sol direto'),
	(4, 'Sol pleno o dia todo'),
	(5, 'Sol da manhã e sombra à tarde'),
	(6, 'Sombra total – ambiente interno');

-- Copiando estrutura para tabela agroplanner.categoriasolo
CREATE TABLE IF NOT EXISTS `categoriasolo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.categoriasolo: ~8 rows (aproximadamente)
INSERT INTO `categoriasolo` (`id`, `nome`) VALUES
	(1, 'Arenoso'),
	(2, 'Argiloso'),
	(3, 'Siltoso'),
	(4, 'Humoso'),
	(5, 'Calcário'),
	(6, 'Gessado'),
	(7, 'Alagado'),
	(8, 'Mistura de solo (composto)');

-- Copiando estrutura para tabela agroplanner.conteudocategoria
CREATE TABLE IF NOT EXISTS `conteudocategoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.conteudocategoria: ~8 rows (aproximadamente)
INSERT INTO `conteudocategoria` (`id`, `nome`) VALUES
	(1, 'Flor'),
	(2, 'Fruta'),
	(3, 'Legume'),
	(4, 'Verdura'),
	(5, 'Erva'),
	(6, 'Raiz'),
	(7, 'Cereal'),
	(8, 'Trepadeira');

-- Copiando estrutura para tabela agroplanner.conteudos
CREATE TABLE IF NOT EXISTS `conteudos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nomePlanta` varchar(100) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `epoca` varchar(50) NOT NULL,
  `temperatura` varchar(20) DEFAULT NULL,
  `solo` text DEFAULT NULL,
  `rega` varchar(50) DEFAULT NULL,
  `sol` varchar(50) DEFAULT NULL,
  `instrucoes` text NOT NULL,
  `id_autor` int(11) NOT NULL,
  `data_publicacao` datetime DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'pendente',
  `favorita` tinyint(1) DEFAULT 0,
  `statusAtivo` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `id_autor` (`id_autor`),
  CONSTRAINT `conteudos_ibfk_1` FOREIGN KEY (`id_autor`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.conteudos: ~3 rows (aproximadamente)
INSERT INTO `conteudos` (`id`, `nomePlanta`, `categoria`, `epoca`, `temperatura`, `solo`, `rega`, `sol`, `instrucoes`, `id_autor`, `data_publicacao`, `status`, `favorita`, `statusAtivo`) VALUES
	(8, '123', 'Legume', 'Inverno', '3', 'Argiloso', '4 semana', 'Pleno sol – mínimo de 4h de sol direto', '123', 1, '2025-06-07 16:35:53', 'aprovado', 0, 1),
	(9, '123', 'Fruta', 'Primavera', '6', 'Siltoso', '5 semana', 'Meia sombra – algumas horas com luz direta', '123', 1, '2025-06-07 16:58:31', 'rejeitado', 0, 1),
	(10, '123', 'Fruta', 'Verão', '5', 'Argiloso', '4 dia', 'Meia sombra – algumas horas com luz direta', '123', 1, '2025-06-07 17:00:31', 'pendente', 0, 1);

-- Copiando estrutura para tabela agroplanner.imagens_conteudo
CREATE TABLE IF NOT EXISTS `imagens_conteudo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_conteudo` int(11) NOT NULL,
  `url` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_conteudo` (`id_conteudo`),
  CONSTRAINT `imagens_conteudo_ibfk_1` FOREIGN KEY (`id_conteudo`) REFERENCES `conteudos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.imagens_conteudo: ~3 rows (aproximadamente)
INSERT INTO `imagens_conteudo` (`id`, `id_conteudo`, `url`) VALUES
	(6, 8, '/uploads/1749324953021-chuchu.jpg'),
	(7, 9, '/uploads/1749326311535-plantar.png'),
	(8, 10, '/uploads/1749326431095-no-star.png');

-- Copiando estrutura para tabela agroplanner.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` enum('comum','admin') DEFAULT 'comum',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.usuarios: ~2 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `tipo`, `criado_em`) VALUES
	(1, 'João Vinicius Latczuk', 'joao.latczuk@fatec.sp.gov.br', '123', 'admin', '2025-05-11 18:06:43'),
	(2, 'Marlene Aparecida Silva', 'marleneescola77@gmail.com', '123', 'comum', '2025-05-11 21:37:09'),
	(3, 'João Vinicius Latczuk', 'joaocontascel@gmail.com', '123', 'comum', '2025-05-13 01:27:41');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
