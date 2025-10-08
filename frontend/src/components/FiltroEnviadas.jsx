import React, { useState, useEffect } from "react";

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
    filtroHeaderIcon: { fontSize: '1.2rem', color: '#888' },
    filtroOpcoes: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '10px',
      paddingTop: '10px',
    },
    radioLabel: { marginBottom: '8px', cursor: 'pointer', fontSize: '0.95rem', color: '#666' },
    radioInput: { marginRight: '8px' },
    botoesFiltro: { display: 'flex', justifyContent: 'space-around', marginTop: '20px' },
    buttonBase: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    aplicarBtn: { backgroundColor: '#2d6a4f', color: 'white' },
    limparBtn: { backgroundColor: '#ccc', color: '#333' }
  };

  // Estados vindos da API
  const [categorias, setCategorias] = useState([]);
  const [epocas, setEpocas]         = useState([]);
  const [solos, setSolos]           = useState([]);
  const [sois, setSois]             = useState([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState("");

  // Filtros selecionados
  const [filtros, setFiltros] = useState({
    id_categoria: "",
    id_epoca: "",
    id_solo: "",
    id_sol: ""
  });

  // Abertura/fechamento dos grupos
  const [abertos, setAbertos] = useState({
    id_categoria: false,
    id_epoca: false,
    id_solo: false,
    id_sol: false
  });

  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/filtros");
        if (!res.ok) throw new Error("Não foi possível carregar os filtros");
        const data = await res.json();
        setCategorias(data.categorias || []);
        setEpocas(data.epocas || []);
        setSolos(data.solos || []);
        setSois(data.sois || []);
        setErro("");
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar filtros do servidor.");
      } finally {
        setLoading(false);
      }
    };
    fetchFiltros();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => onFiltrar(filtros);

  const limparFiltros = () => {
    const reset = { id_categoria: "", id_epoca: "", id_solo: "", id_sol: "" };
    setFiltros(reset);
    onFiltrar(reset);
  };

  const toggleAberto = (nome) => {
    setAbertos(prev => ({ ...prev, [nome]: !prev[nome] }));
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
                value={String(o[idKey])}
                checked={String(filtros[name]) === String(o[idKey])}
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

      {loading && <div>Carregando filtros…</div>}
      {erro && <div style={{ color: "#b00020", marginBottom: 10 }}>{erro}</div>}

      {!loading && !erro && (
        <>
          {renderSelect("id_categoria", "Tipo de Produto", categorias, "id", "nome")}
          {renderSelect("id_epoca", "Época", epocas, "id", "nome")}
          {renderSelect("id_solo", "Solo", solos, "id", "nome")}
          {renderSelect("id_sol", "Tipo de Sol", sois, "id", "nome")}

          <div style={styles.botoesFiltro}>
            <button
              style={{ ...styles.buttonBase, ...styles.aplicarBtn }}
              onClick={aplicarFiltros}
              disabled={loading}
            >
              Aplicar
            </button>
            <button
              style={{ ...styles.buttonBase, ...styles.limparBtn }}
              onClick={limparFiltros}
              disabled={loading}
            >
              Limpar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FiltroEnviadas;