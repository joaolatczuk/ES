import React, { useState } from 'react';
import axios from 'axios';

function FormularioReceita({ idUsuario, categorias, epocas, solos, exposicoes, onSucesso }) {
  const [nomePlanta, setNomePlanta] = useState('');
  const [imagens, setImagens] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [temperatura, setTemperatura] = useState(0);
  const [rega, setRega] = useState(0);
  const [epoca, setEpoca] = useState('');
  const [solo, setSolo] = useState('');
  const [frequenciaUnidade, setFrequenciaUnidade] = useState('');
  const [sol, setSol] = useState('');
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
      formData.append('categoria', categoria);
      formData.append('epoca', epoca);
      formData.append('temperatura', temperatura);
      formData.append('solo', solo);
      formData.append('rega', `${rega} ${frequenciaUnidade}`);
      formData.append('sol', sol);
      formData.append('instrucoes', instrucoes);
      formData.append('id_autor', idUsuario);
      imagens.forEach(imagem => formData.append('imagens', imagem));
      console.log('Enviando receita:', {
        nomePlanta,
        categoria,
        epoca,
        temperatura,
        solo,
        rega: `${rega} ${frequenciaUnidade}`,
        sol,
        instrucoes,
        imagens
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
      <label>Nome da planta:</label>
      <input value={nomePlanta} onChange={e => setNomePlanta(e.target.value)} required />
      <label>Imagens do plantio:</label>
      <input type="file" multiple onChange={e => setImagens(Array.from(e.target.files))} />
      <label>Categoria:</label>
      <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
        <option value="">Selecione</option>
        {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
      </select>
      <label>Época ideal de plantio:</label>
      <select value={epoca} onChange={e => setEpoca(e.target.value)} required>
        <option value="">Selecione</option>
        {epocas.map(e => <option key={e.id} value={e.nome}>{e.nome}</option>)}
      </select>
      <label>Temperatura ideal (°C):</label>
      <div className="input-numero-custom">
        <button type="button" onMouseDown={startDecrementTemp} onMouseUp={stopChangeTemp} onMouseLeave={stopChangeTemp}>–</button>
        <input className="input-valor" value={temperatura} readOnly />
        <button type="button" onMouseDown={startIncrementTemp} onMouseUp={stopChangeTemp} onMouseLeave={stopChangeTemp}>+</button>
      </div>
      <label>Tipo de solo:</label>
      <select value={solo} onChange={e => setSolo(e.target.value)} required>
        <option value="">Selecione</option>
        {solos.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
      </select>
      <label>Frequência de rega:</label>
      <div className="input-numero-unidade">
        <button type="button" onMouseDown={startDecrementRega} onMouseUp={stopChangeRega} onMouseLeave={stopChangeRega}>–</button>
        <input className="input-valor" value={rega} readOnly />
        <button type="button" onMouseDown={startIncrementRega} onMouseUp={stopChangeRega} onMouseLeave={stopChangeRega}>+</button>
        <select value={frequenciaUnidade} onChange={e => setFrequenciaUnidade(e.target.value)} required>
          <option value="">Unidade</option>
          <option value="dia">por dia</option>
          <option value="semana">por semana</option>
          <option value="mês">por mês</option>
        </select>
      </div>
      <label>Exposição ao sol:</label>
      <select value={sol} onChange={e => setSol(e.target.value)} required>
        <option value="">Selecione</option>
        {exposicoes.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
      </select>
      <label>Instruções de plantio:</label>
      <textarea value={instrucoes} onChange={e => setInstrucoes(e.target.value)} required />
      <button type="submit">Postar Receita</button>
    </form>
  );
}

export default FormularioReceita;