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

-- Copiando estrutura para tabela agroplanner.conteudocategoria
CREATE TABLE IF NOT EXISTS `conteudocategoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.conteudocategoria: ~8 rows (aproximadamente)
INSERT IGNORE INTO `conteudocategoria` (`id`, `nome`) VALUES
	(1, 'Flor'),
	(2, 'Fruta'),
	(3, 'Legume'),
	(4, 'Verdura'),
	(5, 'Erva'),
	(6, 'Raiz'),
	(7, 'Cereal'),
	(8, 'Trepadeira');

-- Copiando estrutura para tabela agroplanner.conteudoepoca
CREATE TABLE IF NOT EXISTS `conteudoepoca` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.conteudoepoca: ~7 rows (aproximadamente)
INSERT IGNORE INTO `conteudoepoca` (`id`, `nome`) VALUES
	(1, 'Primavera'),
	(2, 'Verão'),
	(3, 'Outono'),
	(4, 'Inverno'),
	(5, 'Ano todo'),
	(6, 'Estação seca'),
	(7, 'Estação chuvosa');

-- Copiando estrutura para tabela agroplanner.conteudos
CREATE TABLE IF NOT EXISTS `conteudos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nomePlanta` varchar(100) NOT NULL,
  `temperatura` varchar(20) DEFAULT NULL,
  `rega` varchar(50) DEFAULT NULL,
  `instrucoes` text NOT NULL,
  `id_autor` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_epoca` int(11) DEFAULT NULL,
  `id_solo` int(11) DEFAULT NULL,
  `id_sol` int(11) DEFAULT NULL,
  `data_publicacao` datetime DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'pendente',
  `statusAtivo` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `id_autor` (`id_autor`),
  KEY `id_categoria` (`id_categoria`),
  KEY `id_epoca` (`id_epoca`),
  KEY `id_solo` (`id_solo`),
  KEY `id_sol` (`id_sol`),
  CONSTRAINT `conteudos_ibfk_1` FOREIGN KEY (`id_autor`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conteudos_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `conteudocategoria` (`id`),
  CONSTRAINT `conteudos_ibfk_3` FOREIGN KEY (`id_epoca`) REFERENCES `conteudoepoca` (`id`),
  CONSTRAINT `conteudos_ibfk_4` FOREIGN KEY (`id_solo`) REFERENCES `conteudosolo` (`id`),
  CONSTRAINT `conteudos_ibfk_5` FOREIGN KEY (`id_sol`) REFERENCES `conteudosol` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.conteudos: ~7 rows (aproximadamente)
INSERT IGNORE INTO `conteudos` (`id`, `nomePlanta`, `temperatura`, `rega`, `instrucoes`, `id_autor`, `id_categoria`, `id_epoca`, `id_solo`, `id_sol`, `data_publicacao`, `status`, `statusAtivo`) VALUES
	(1, '123', '3', '4 semana', '123', 1, 3, 4, 2, 1, '2025-06-07 16:35:53', 'aprovado', 0),
	(2, '123', '6', '5 semana', '123', 1, 2, 1, 3, 2, '2025-06-07 16:58:31', 'rejeitado', 1),
	(3, '123', '5', '4 dia', '123', 1, 2, 2, 2, 2, '2025-06-07 17:00:31', 'aprovado', 1),
	(4, '123', '8', '8 dia', '123', 1, 1, 1, 1, 4, '2025-06-08 11:54:51', 'aprovado', 1),
	(5, '123', '22', '7 semana', '3312ljhpiahpauPIUHPI', 1, 2, 2, 4, 3, '2025-06-08 11:55:26', 'aprovado', 1),
	(6, '123', '13', '4 mês', 'IODUOIUiouaposuiipsauoOIUP', 1, 6, 2, 4, 1, '2025-06-08 11:56:00', 'aprovado', 1),
	(9, '123', '6', '8 semana', '123321', 1, 4, 1, 4, 6, '2025-06-09 23:15:48', 'aprovado', 1);

-- Copiando estrutura para tabela agroplanner.conteudosol
CREATE TABLE IF NOT EXISTS `conteudosol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.conteudosol: ~6 rows (aproximadamente)
INSERT IGNORE INTO `conteudosol` (`id`, `nome`) VALUES
	(1, 'Pleno sol – mínimo de 4h de sol direto'),
	(2, 'Meia sombra – algumas horas com luz direta'),
	(3, 'Sombra – luz indireta, sem sol direto'),
	(4, 'Sol pleno o dia todo'),
	(5, 'Sol da manhã e sombra à tarde'),
	(6, 'Sombra total – ambiente interno');

-- Copiando estrutura para tabela agroplanner.conteudosolo
CREATE TABLE IF NOT EXISTS `conteudosolo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.conteudosolo: ~8 rows (aproximadamente)
INSERT IGNORE INTO `conteudosolo` (`id`, `nome`) VALUES
	(1, 'Arenoso'),
	(2, 'Argiloso'),
	(3, 'Siltoso'),
	(4, 'Humoso'),
	(5, 'Calcário'),
	(6, 'Gessado'),
	(7, 'Alagado'),
	(8, 'Mistura de solo (composto)');

-- Copiando estrutura para tabela agroplanner.favoritos
CREATE TABLE IF NOT EXISTS `favoritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_conteudo` int(11) NOT NULL,
  `statusAtivo` tinyint(4) DEFAULT 1,
  `data_favorito` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_conteudo` (`id_conteudo`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`id_conteudo`) REFERENCES `conteudos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.favoritos: ~1 rows (aproximadamente)
INSERT IGNORE INTO `favoritos` (`id`, `id_usuario`, `id_conteudo`, `statusAtivo`, `data_favorito`) VALUES
	(1, 1, 2, 1, '2025-06-10 23:51:47');

-- Copiando estrutura para tabela agroplanner.imagens_conteudo
CREATE TABLE IF NOT EXISTS `imagens_conteudo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_conteudo` int(11) NOT NULL,
  `url` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_conteudo` (`id_conteudo`),
  CONSTRAINT `imagens_conteudo_ibfk_1` FOREIGN KEY (`id_conteudo`) REFERENCES `conteudos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agroplanner.imagens_conteudo: ~2 rows (aproximadamente)
INSERT IGNORE INTO `imagens_conteudo` (`id`, `id_conteudo`, `url`) VALUES
	(3, 9, '/uploads/1749521748939-vecteezy_gradient-paper-cut-style-background-with-gray-colours_26562701.png');

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

-- Copiando dados para a tabela agroplanner.usuarios: ~3 rows (aproximadamente)
INSERT IGNORE INTO `usuarios` (`id`, `nome`, `email`, `senha`, `tipo`, `criado_em`) VALUES
	(1, 'João Vinicius Latczuk', 'joao.latczuk@fatec.sp.gov.br', '123', 'admin', '2025-05-11 21:06:43'),
	(2, 'Marlene Aparecida Silva', 'marleneescola77@gmail.com', '123', 'comum', '2025-05-12 00:37:09'),
	(3, 'João Vinicius Latczuk', 'joaocontascel@gmail.com', '123', 'comum', '2025-05-13 04:27:41');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
