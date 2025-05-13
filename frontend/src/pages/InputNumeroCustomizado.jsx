import React from 'react';
import './style.css'; // garante que o estilo seja aplicado

function InputNumeroCustomizado({ valor, setValor, min = 0 }) {
  const incrementar = () => setValor(prev => Math.max(min, prev + 1));
  const decrementar = () => setValor(prev => Math.max(min, prev - 1));

  return (
    <div className="input-numero-custom">
      <button type="button" className="btn-menor" onClick={decrementar}>–</button>
      <input
        type="text"
        value={valor}
        readOnly
        className="input-valor"
      />
      <button type="button" className="btn-maior" onClick={incrementar}>+</button>
    </div>
  );
}

export default InputNumeroCustomizado;
