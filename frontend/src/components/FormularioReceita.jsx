import React, { useState } from 'react';
import axios from 'axios';

function FormularioReceita({ idUsuario, categorias, epocas, solos, exposicoes, onSucesso }) {
  const [nomePlanta, setNomePlanta] = useState('');
  const [imagens, setImagens] = useState([]);
  const [idCategoria, setIdCategoria] = useState('');
  const [temperatura, setTemperatura] = useState(0);
  const [rega, setRega] = useState(0);
  const [idEpoca, setIdEpoca] = useState('');
  const [idSolo, setIdSolo] = useState('');
  const [frequenciaUnidade, setFrequenciaUnidade] = useState('');
  const [idSol, setIdSol] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [intervalTempId, setIntervalTempId] = useState(null);
  const [intervalRegaId, setIntervalRegaId] = useState(null);

  const startIncrementTemp = () => {
    const id = setInterval(() => setTemperatura(prev => Number(prev) + 1), 100);
    setIntervalTempId(id);
  };
  const startDecrementTemp = () => {
    const id = setInterval(() => setTemperatura(prev => Math.max(0, Number(prev) - 1)), 100);
    setIntervalTempId(id);
  };
  const stopChangeTemp = () => clearInterval(intervalTempId);

  const startIncrementRega = () => {
    const id = setInterval(() => setRega(prev => Number(prev) + 1), 100);
    setIntervalRegaId(id);
  };
  const startDecrementRega = () => {
    const id = setInterval(() => setRega(prev => Math.max(0, Number(prev) - 1)), 100);
    setIntervalRegaId(id);
  };
  const stopChangeRega = () => clearInterval(intervalRegaId);

  const postarReceita = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nomePlanta', nomePlanta);
      formData.append('id_categoria', idCategoria);
      formData.append('id_epoca', idEpoca);
      formData.append('temperatura', temperatura);
      formData.append('id_solo', idSolo);
      formData.append('rega', `${rega} ${frequenciaUnidade}`);
      formData.append('id_sol', idSol);
      formData.append('instrucoes', instrucoes);
      formData.append('id_autor', idUsuario);
      imagens.forEach(imagem => formData.append('imagens', imagem));

      console.log('Dados enviados:', {
        nomePlanta, idCategoria, idEpoca, temperatura,
        idSolo, rega: `${rega} ${frequenciaUnidade}`, idSol, instrucoes
      });

      await axios.post('http://localhost:5000/api/conteudos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (onSucesso) onSucesso();
    } catch (error) {
      console.error('ERRO AO POSTAR RECEITA:', error);
    }
  };

  return (
    <form className="formulario" onSubmit={postarReceita}>
      <div className="campo-formulario">
        <label htmlFor="nomePlanta">Nome da planta:</label>
        <input
          id="nomePlanta"
          type="text"
          className="input-valor"
          value={nomePlanta}
          onChange={e => setNomePlanta(e.target.value)}
          required
        />
      </div>


      <label>Imagens do plantio:</label>
      <input type="file" multiple onChange={e => setImagens(Array.from(e.target.files))} />

      <label>Categoria:</label>
      <select value={idCategoria} onChange={e => setIdCategoria(e.target.value)} required>
        <option value="">Selecione</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>

      <label>Época ideal de plantio:</label>
      <select value={idEpoca} onChange={e => setIdEpoca(e.target.value)} required>
        <option value="">Selecione</option>
        {epocas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
      </select>

      <label>Temperatura ideal (°C):</label>
      <div className="input-numero-custom">
        <button type="button" onMouseDown={startDecrementTemp} onMouseUp={stopChangeTemp} onMouseLeave={stopChangeTemp}>–</button>
        <input className="input-valor" value={temperatura} readOnly />
        <button type="button" onMouseDown={startIncrementTemp} onMouseUp={stopChangeTemp} onMouseLeave={stopChangeTemp}>+</button>
      </div>

      <label>Tipo de solo:</label>
      <select value={idSolo} onChange={e => setIdSolo(e.target.value)} required>
        <option value="">Selecione</option>
        {solos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
      </select>

      <div className="campo-formulario">
        <label>Frequência de rega:</label>
        <div className="input-numero-unidade">
          <button
            type="button"
            onMouseDown={startDecrementRega}
            onMouseUp={stopChangeRega}
            onMouseLeave={stopChangeRega}
          >
            –
          </button>
          <input className="input-valor" value={rega} readOnly />
          <button
            type="button"
            onMouseDown={startIncrementRega}
            onMouseUp={stopChangeRega}
            onMouseLeave={stopChangeRega}
          >
            +
          </button>
          <select
            value={frequenciaUnidade}
            onChange={e => setFrequenciaUnidade(e.target.value)}
            required
          >
            <option value="">Unidade</option>
            <option value="dia">por dia</option>
            <option value="semana">por semana</option>
            <option value="mês">por mês</option>
          </select>
        </div>
      </div>


      <label>Exposição ao sol:</label>
      <select value={idSol} onChange={e => setIdSol(e.target.value)} required>
        <option value="">Selecione</option>
        {exposicoes.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
      </select>

      <label>Instruções de plantio:</label>
      <textarea value={instrucoes} onChange={e => setInstrucoes(e.target.value)} required />

      <button type="submit">Postar Receita</button>
    </form>
  );
}

export default FormularioReceita;