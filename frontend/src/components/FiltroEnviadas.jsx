import React, { useState } from "react";

const FiltroEnviadas = ({ onFiltrar }) => {

  const styles = {
    filtroEnviadasContainer: {
      width: '230px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '15px',
      fontFamily: 'Arial, sans-serif',
    },
    filtroEnviadasHeader: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
    },
    filtroItem: {
      borderBottom: '1px solid #ddd',
      padding: '10px 0',
    },
    filtroHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '5px',
      userSelect: 'none',
    },
    filtroHeaderTitle: {
      margin: '0',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#555',
    },
    filtroHeaderIcon: {
      fontSize: '1.2rem',
      color: '#888',
    },
    filtroOpcoes: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '10px',
      paddingTop: '10px',
    },
    radioLabel: {
      marginBottom: '8px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      color: '#666',
    },
    radioInput: {
      marginRight: '8px',
    },
    botoesFiltro: {
      display: 'flex',
      justifyContent: 'space-around',
      marginTop: '20px',
    },
    buttonBase: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 'bold',
      cursor: 'pointer',
      // Note: transições e pseudo-classes como :hover não funcionam com estilos embutidos
    },
    aplicarBtn: {
      backgroundColor: '#2d6a4f',
      color: 'white',
    },
    limparBtn: {
      backgroundColor: '#ccc',
      color: '#333',
    }
  };

  // Opções criadas manualmente para evitar a dependência da API
  const [categorias] = useState([
    { id: 1, nome: "Flor" },
    { id: 2, nome: "Fruta" },
    { id: 3, nome: "Legume" },
    { id: 4, nome: "Verdura" },
    { id: 5, nome: "Erva" },
    { id: 6, nome: "Raiz" },
    { id: 7, nome: "Cereal" },
    { id: 8, nome: "Trepadeira" }
  ]);
  const [epocas] = useState([
    { id: 1, nome: "Primavera" },
    { id: 2, nome: "Verão" },
    { id: 3, nome: "Outono" },
    { id: 4, nome: "Inverno" },
    { id: 5, nome: "Ano todo" },
    { id: 6, nome: "Estação seca" },
    { id: 7, nome: "Estação chuvosa" }
  ]);
  const [solos] = useState([
    { id: 1, nome: "Arenoso" },
    { id: 2, nome: "Argiloso" },
    { id: 3, nome: "Siltoso" },
    { id: 4, nome: "Humoso" },
    { id: 5, nome: "Calcário" },
    { id: 6, nome: "Gessado" },
    { id: 7, nome: "Alagado" },
    { id: 8, nome: "Mistura de solo (composto)" }
  ]);
  const [sóis] = useState([
    { id: 1, nome: "Pleno sol" },
    { id: 2, nome: "Meia sombra" },
    { id: 3, nome: "Sombra" },
    { id: 4, nome: "Sol pleno o dia todo" },
    { id: 5, nome: "Sol da manhã e sombra à tarde" },
    { id: 6, nome: "Sombra total" }
  ]);

  const [filtros, setFiltros] = useState({
    id_categoria: "",
    id_epoca: "",
    id_solo: "",
    id_sol: ""
  });

  const [abertos, setAbertos] = useState({
    id_categoria: false,
    id_epoca: false,
    id_solo: false,
    id_sol: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const aplicarFiltros = () => {
    onFiltrar(filtros);
  };

  const limparFiltros = () => {
    const reset = { id_categoria: "", id_epoca: "", id_solo: "", id_sol: "" };
    setFiltros(reset);
    onFiltrar(reset);
  };

  const toggleAberto = (nome) => {
    setAbertos(prev => ({
      ...prev,
      [nome]: !prev[nome]
    }));
  };

  const renderSelect = (name, label, options, idKey, nameKey) => (
    <div style={styles.filtroItem}>
      <div style={styles.filtroHeader} onClick={() => toggleAberto(name)}>
        <h4 style={styles.filtroHeaderTitle}>{label}</h4>
        <span style={styles.filtroHeaderIcon}>{abertos[name] ? '▲' : '▼'}</span>
      </div>
      {abertos[name] && (
        <div style={styles.filtroOpcoes}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name={name}
              value=""
              checked={filtros[name] === ""}
              onChange={handleChange}
              style={styles.radioInput}
            />
            Todos
          </label>
          {Array.isArray(options) && options.map(o => (
            <label key={o[idKey]} style={styles.radioLabel}>
              <input
                type="radio"
                name={name}
                value={o[idKey]}
                checked={filtros[name] == o[idKey]}
                onChange={handleChange}
                style={styles.radioInput}
              />
              {o[nameKey]}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.filtroEnviadasContainer}>
      <h3 style={styles.filtroEnviadasHeader}>Filtrar Receitas</h3>
      {renderSelect("id_categoria", "Tipo de Produto", categorias, "id", "nome")}
      {renderSelect("id_epoca", "Época", epocas, "id", "nome")}
      {renderSelect("id_solo", "Solo", solos, "id", "nome")}
      {renderSelect("id_sol", "Tipo de Sol", sóis, "id", "nome")}

      <div style={styles.botoesFiltro}>
        <button
          style={{ ...styles.buttonBase, ...styles.aplicarBtn }}
          onClick={aplicarFiltros}>
          Aplicar
        </button>
        <button
          style={{ ...styles.buttonBase, ...styles.limparBtn }}
          onClick={limparFiltros}>
          Limpar
        </button>
      </div>
    </div>
  );
};

export default FiltroEnviadas;