// BotaoAcao.jsx
import React from "react";
import Swal from "sweetalert2";

function BotaoAcao({
  label,
  tipo = "neutro",
  tamanho = "padrao",
  icone,
  carregando = false,
  onClick,
  autoSuccess = true, // 👈 novo: controla o Swal automático
}) {
  const handleClick = (e) => {
    e.preventDefault();
    if (carregando) return;

    onClick?.();

    // só mostra o sucesso automático se habilitado
    if (!autoSuccess) return;

    if (tipo === "ver" || tipo === "voltar" || tipo === "neutro" || carregando) {
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Alteração realizada!",
      text: `Ação "${label}" concluída com sucesso.`,
      showConfirmButton: true,
    });
  };

  const estilosPorTipo = {
    info: { backgroundColor: '#2e66f3', color: '#fff' },
    sucesso: { backgroundColor: '#4CAF50', color: '#fff' },
    perigo: { backgroundColor: '#f44336', color: '#fff' },
    excluir: { backgroundColor: '#f44336', color: '#fff' },
    neutro: { backgroundColor: '#e0e0e0', color: '#333' },
    primario: { backgroundColor: '#212121', color: '#fff' },
    ver: { backgroundColor: '#2e66f3', color: '#fff' },
    aprovar: { backgroundColor: '#4CAF50', color: '#fff' },
    rejeitar: { backgroundColor: '#f44336', color: '#fff' },
    'excluir-registro': { backgroundColor: '#f44336', color: '#fff' },
    voltar: { backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ccc' },
    fechar: { backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ccc' }
  };

  const estilosPorTamanho = {
    pequeno: { padding: '6px 12px', fontSize: '0.85rem' },
    padrao: { padding: '10px 20px', fontSize: '1rem' },
    grande: { padding: '14px 28px', fontSize: '1.1rem' }
  };

  const estiloBase = {
    fontFamily: 'inherit',
    fontWeight: 500,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none'
  };

  const estilosFinais = {
    ...estiloBase,
    ...estilosPorTipo[tipo],
    ...estilosPorTamanho[tamanho],
    ...(carregando ? { opacity: 0.6, cursor: 'wait' } : {})
  };

  return (
    <button style={estilosFinais} onClick={handleClick} disabled={carregando}>
      {carregando ? (
        <>
          <span style={{
            display: 'inline-block',
            width: '1rem',
            height: '1rem',
            verticalAlign: 'text-bottom',
            border: '0.2em solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spinner-border 0.75s linear infinite'
          }}></span>
          {label.replace('ando...', '').replace('ando', '')}ando...
        </>
      ) : (
        <>
          {icone && <img src={icone} alt="" style={{ width: '18px', height: '18px' }} />}
          {label}
        </>
      )}
    </button>
  );
}

export default BotaoAcao;