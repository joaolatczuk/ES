function BotaoAcao({ label, tipo = "padrao", onClick }) {
  const baseStyle = {
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s",
    cursor: "pointer",
    border: "none",
  };

  const estilos = {
    ver: { backgroundColor: "#22c55e", color: "white" },        // verde
    aprovar: { backgroundColor: "#3b82f6", color: "white" },    // azul
    rejeitar: { backgroundColor: "#facc15", color: "white" },   // amarelo
    excluir: { backgroundColor: "#dc2626", color: "white" },    // vermelho
    padrao: { backgroundColor: "#6b7280", color: "white" },     // cinza
  };

  const style = { ...baseStyle, ...(estilos[tipo] || estilos.padrao) };

  return (
    <button style={style} onClick={onClick}>
      {label}
    </button>
  );
}

export default BotaoAcao;