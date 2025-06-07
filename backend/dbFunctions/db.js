const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Função utilitária para SELECT *
async function select_all(tabela) {
  const [rows] = await pool.query(`SELECT * FROM ${tabela}`);
  return rows;
}

module.exports = {
  select_all,                 // ✅ importante!
  query: (...args) => pool.query(...args)
};
