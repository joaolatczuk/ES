import React, { useState } from 'react';
import axios from 'axios';

function FormularioReceita({ idUsuario, categorias, epocas, solos, exposicoes, onSucesso }) {
  const [nomePlanta, setNomePlanta] = useState('');
  const [imagens, setImagens] = useState([]);
  const [idCategoria, setIdCategoria] = useState('');
  const [temperatura, setTemperatura] = useState(20);
  const [rega, setRega] = useState(1);
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
    <>
      <style>{`
        /* Base styles for the form container */
        .formulario {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          background-color: #f7f7f7;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          font-family: Arial, sans-serif;
        }

        /* Styles for a main section, like "Nome da Planta" or "Instruções" */
        .section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Styles for labels with icons */
        .section label {
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section label::before {
          display: inline-block;
          width: 20px;
          height: 20px;
          background-size: contain;
          background-repeat: no-repeat;
        }

        /* Specific icons for each label, using pseudo-elements */
        label[for="nomePlanta"]::before {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>');
        }
        label[for="categoria"]::before {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2z"></path></svg>');
        }
        label[for="epoca"]::before {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>');
        }
        label[for="temperatura"]::before {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>');
        }
        label[for="rega"]::before {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L6 8h12z"></path><path d="M12 22L6 16h12z"></path></svg>');
        }
        label[for="solo"]::before {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.49 2-2.5 2-3.5S20.5 7.5 19 6c-1.5-1.5-3.5-2.5-5-2.5S11.5 4.5 10 6c-1.5 1.5-2 2.5-2 3.5s.5 2 2 3.5"></path></svg>');
        }
        label[for="exposicao"]::before {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>');
        }
        label[for="instrucoes"]::before {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1.5l2 2.5L12 21l4.5-14.5L18.5 2H22z"></path></svg>');
        }

        /* Base styles for all inputs */
        input[type="text"],
        select,
        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        }

        input[type="text"]::placeholder,
        textarea::placeholder {
          color: #a0a0a0;
          font-style: italic;
        }

        textarea {
          min-height: 150px;
          resize: vertical;
        }

        /* Grid layout for the main input fields */
        .grid-2-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Custom styles for the number inputs with buttons */
        .number-input-group {
          display: flex;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }

        .number-input-group button {
          border: none;
          padding: 12px 16px;
          font-size: 20px;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
          user-select: none;
          font-weight: bold;
        }

        /* Specific colors for the increment and decrement buttons */
        .number-input-group button:first-of-type {
          background-color: #e0e0e0;
          color: #d9534f; /* Red for decrement */
        }

        .number-input-group button:last-of-type {
          background-color: #e0e0e0;
          color: #2d6a4f; /* Green for increment */
        }
        
        .number-input-group button:hover {
          background-color: #d0d0d0;
        }

        .number-input-group .number-input {
          flex-grow: 1;
          text-align: center;
          border: none;
          padding: 12px 0;
          font-size: 16px;
          background-color: transparent;
        }

        .number-input-group.with-unit select {
          border: none;
          border-left: 1px solid #ccc;
          padding: 10px;
          background-color: #fff;
          cursor: pointer;
          font-size: 14px;
        }

        /* Upload area styling */
        .upload-section .upload-container {
          position: relative;
          border: 2px dashed #ccc;
          border-radius: 8px;
          text-align: center;
          padding: 40px 20px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .upload-section .upload-container:hover {
          border-color: #888;
        }

        .upload-section input[type="file"] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .upload-section .upload-text {
          color: #888;
          font-size: 16px;
        }

        .submit-button {
          background-color: #2d6a4f;
          color: white;
          padding: 15px;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 20px;
        }

        .submit-button:hover {
          background-color: #218838;
        }

        /* Media query for smaller screens */
        @media (max-width: 768px) {
          .grid-2-columns {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <form className="formulario" onSubmit={postarReceita}>
        <div className="section">
          <label htmlFor="nomePlanta">Nome da Planta</label>
          <input
            id="nomePlanta"
            type="text"
            placeholder="Ex: Manjericão, Rosa, Tomate..."
            value={nomePlanta}
            onChange={e => setNomePlanta(e.target.value)}
            required
          />
        </div>

        <div className="section upload-section">
          <label>Imagens do Plantio</label>
          <div className="upload-container">
            <input
              type="file"
              multiple
              onChange={e => setImagens(Array.from(e.target.files))}
            />
            <div className="upload-text">
              <span>Clique para selecionar imagens ou arraste aqui</span>
            </div>
          </div>
        </div>

        <div className="grid-2-columns">
          <div className="input-group">
            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" value={idCategoria} onChange={e => setIdCategoria(e.target.value)} required>
              <option value="">Selecione a categoria</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="epoca">Época Ideal</label>
            <select id="epoca" value={idEpoca} onChange={e => setIdEpoca(e.target.value)} required>
              <option value="">Selecione a época</option>
              {epocas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="temperatura">Temperatura Ideal (°C)</label>
            <div className="number-input-group">
              <button
                type="button"
                onMouseDown={startDecrementTemp}
                onMouseUp={stopChangeTemp}
                onMouseLeave={stopChangeTemp}
              >
                –
              </button>
              <input id="temperatura" className="number-input" value={`${temperatura}°C`} readOnly />
              <button
                type="button"
                onMouseDown={startIncrementTemp}
                onMouseUp={stopChangeTemp}
                onMouseLeave={stopChangeTemp}
              >
                +
              </button>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="rega">Frequência de Rega</label>
            <div className="number-input-group with-unit">
              <button
                type="button"
                onMouseDown={startDecrementRega}
                onMouseUp={stopChangeRega}
                onMouseLeave={stopChangeRega}
              >
                –
              </button>
              <input className="number-input" value={rega} readOnly />
              <button
                type="button"
                onMouseDown={startIncrementRega}
                onMouseUp={stopChangeRega}
                onMouseLeave={stopChangeRega}
              >
                +
              </button>
              <select value={frequenciaUnidade} onChange={e => setFrequenciaUnidade(e.target.value)} required>
                <option value="">Unidade</option>
                <option value="dia">dia</option>
                <option value="semana">semana</option>
                <option value="mes">mês</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="solo">Tipo de Solo</label>
            <select id="solo" value={idSolo} onChange={e => setIdSolo(e.target.value)} required>
              <option value="">Selecione o tipo de solo</option>
              {solos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="exposicao">Exposição ao Sol</label>
            <select id="exposicao" value={idSol} onChange={e => setIdSol(e.target.value)} required>
              <option value="">Selecione a exposição</option>
              {exposicoes.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
        </div>
        <div className="section">
          <label htmlFor="instrucoes">Instruções de Plantio</label>
          <textarea
            id="instrucoes"
            placeholder="Descreva o passo a passo para o plantio, cuidados especiais, dicas importantes..."
            value={instrucoes}
            onChange={e => setInstrucoes(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">Postar Receita</button>
      </form>
    </>
  );
}

export default FormularioReceita;