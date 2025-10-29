// src/pages/ModeracaoAdicionarTipos.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Topo from '../components/Topo';
import BotaoAcao from '../components/BotaoAcao';
import AcessoNegado from '../components/AcessoNegado';

const PRIMARY = '#1b4332';   // mesmo verde da tela de Usuários (títulos/headers)
const PRIMARY_2 = '#2d6a4f'; // verde de ação (botões cheios)
const LIGHT = '#ecf4ef';
const API_BASE = 'http://localhost:5000/api';

const CONFIG = {
  categoria: { titulo: 'Categoria', pasta: 'categoria', postUrl: `${API_BASE}/admin/conteudocategoria`, listUrl: `${API_BASE}/admin/conteudocategoria`, campos: ['nome', 'url'] },
  epoca:     { titulo: 'Época',     pasta: 'estacao',  postUrl: `${API_BASE}/admin/conteudoepoca`,     listUrl: `${API_BASE}/admin/conteudoepoca`,     campos: ['nome', 'url'] },
  solo:      { titulo: 'Solo',      pasta: 'solo',     postUrl: `${API_BASE}/admin/conteudosolo`,      listUrl: `${API_BASE}/admin/conteudosolo`,      campos: ['nome', 'observacao', 'url'] },
  sol:       { titulo: 'Exposição ao Sol', pasta: 'sol', postUrl: `${API_BASE}/admin/conteudosol`,     listUrl: `${API_BASE}/admin/conteudosol`,       campos: ['nome', 'observacao', 'url'] },
};

function ModeracaoAdicionarTipos() {
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }, []);
  const isAdmin = user?.role === 'admin';

  const [mainTab, setMainTab] = useState('adicionar'); // 'adicionar' | 'gerenciar'
  const [active, setActive] = useState('categoria');

  // adicionar
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState({
    categoria: { nome: '', url: '' },
    epoca: { nome: '', url: '' },
    solo: { nome: '', observacao: '', url: '' },
    sol: { nome: '', observacao: '', url: '' },
  });

  // upload / busca
  const fileRef = useRef(null);
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [arquivos, setArquivos] = useState([]);
  const [filtro, setFiltro] = useState('');

  // gerenciar
  const [lista, setLista] = useState([]);
  const [busca, setBusca] = useState('');
  const [busyList, setBusyList] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editObj, setEditObj] = useState({});

  const cfg = CONFIG[active];

  const handleChange = (campo, valor) => {
    setForms(prev => ({ ...prev, [active]: { ...prev[active], [campo]: valor } }));
  };

  // ============== ADICIONAR ==============
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await axios.post(`${API_BASE}/admin/upload?folder=${cfg.pasta}`, fd, { headers: { 'x-admin': '1' } });
      const url = data?.url || data?.path;
      if (!url) throw new Error('Resposta sem URL do arquivo.');
      handleChange('url', url);
      Swal.fire({ icon: 'success', title: 'Imagem enviada!', timer: 1200, showConfirmButton: false });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Falha no upload.';
      Swal.fire({ icon: 'error', title: 'Falha no upload', text: msg });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
      setLoading(false);
    }
  };

  const abrirBusca = async () => {
    try {
      setMostrarBusca(true);
      setArquivos([]);
      setFiltro('');
      const { data } = await axios.get(`${API_BASE}/admin/static-list?folder=${cfg.pasta}`, { headers: { 'x-admin': '1' } });
      const list = Array.isArray(data?.files) ? data.files : Array.isArray(data) ? data : [];
      setArquivos(list);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Listagem indisponível';
      Swal.fire({ icon: 'info', title: 'Listagem indisponível', text: msg });
    }
  };

  const selecionarArquivo = (url) => {
    handleChange('url', url);
    setMostrarBusca(false);
  };

  const validar = () => {
    const f = forms[active];
    if (!String(f.nome || '').trim()) {
      Swal.fire({ icon: 'warning', title: `Informe o nome (${cfg.titulo})` });
      return false;
    }
    return true;
  };

  const salvar = async () => {
    if (!validar()) return;
    try {
      setLoading(true);
      const body = { ...forms[active] };
      Object.keys(body).forEach(k => { if (String(body[k] || '').trim() === '') body[k] = null; });
      await axios.post(cfg.postUrl, body, { headers: { 'x-admin': '1' } });
      Swal.fire({ icon: 'success', title: `${cfg.titulo} adicionad${active === 'categoria' ? 'a' : 'o'}!`, timer: 1400, showConfirmButton: false });
      setForms(prev => ({ ...prev, [active]: Object.fromEntries(cfg.campos.map(c => [c, ''])) }));
      if (mainTab === 'gerenciar') fetchLista();
    } catch (err) {
      Swal.fire({ icon: 'error', title: `Erro ao salvar ${cfg.titulo}`, text: err?.response?.data?.error || err?.response?.data?.message || 'Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  // fecha modal com ESC
  useEffect(() => {
    if (!mostrarBusca) return;
    const onKey = (e) => { if (e.key === 'Escape') setMostrarBusca(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mostrarBusca]);

  // ============== GERENCIAR ==============
  const fetchLista = async () => {
    try {
      setBusyList(true);
      const { data } = await axios.get(cfg.listUrl, { headers: { 'x-admin': '1' } });
      setLista(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erro ao carregar lista', text: err?.response?.data?.error || 'Tente novamente.' });
    } finally {
      setBusyList(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'gerenciar') fetchLista();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mainTab]);

  const startEdit = (row) => {
    setEditId(row.id);
    setEditObj({ nome: row.nome ?? '', observacao: row.observacao ?? '', url: row.url ?? '' });
  };
  const cancelEdit = () => { setEditId(null); setEditObj({}); };
  const saveEdit = async (id) => {
    try {
      const payload = {};
      CONFIG[active].campos.forEach(c => {
        if (editObj[c] !== undefined) payload[c] = (String(editObj[c] || '').trim() === '' ? null : editObj[c]);
      });
      await axios.put(`${cfg.postUrl}/${id}`, payload, { headers: { 'x-admin': '1' } });
      Swal.fire({ icon: 'success', title: 'Registro atualizado!', timer: 1200, showConfirmButton: false });
      cancelEdit(); fetchLista();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erro ao atualizar', text: err?.response?.data?.error || 'Tente novamente.' });
    }
  };
  const deleteRow = async (id) => {
    const ok = await Swal.fire({ icon: 'warning', title: 'Excluir registro?', text: 'Esta ação não pode ser desfeita.', showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar' });
    if (!ok.isConfirmed) return;
    try {
      await axios.delete(`${cfg.postUrl}/${id}`, { headers: { 'x-admin': '1' } });
      Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1000, showConfirmButton: false });
      fetchLista();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erro ao excluir', text: err?.response?.data?.error || 'Tente novamente.' });
    }
  };

  if (!isAdmin) return <AcessoNegado />;

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.08)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Topo centralizado comMenu />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 16px' }}>
        <div style={{ width: '100%', maxWidth: 1100, backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          {/* Cabeçalho */}
          <div style={{ backgroundColor: PRIMARY, color: '#fff', padding: 20 }}>
            <h1 style={{ margin: 0, fontSize: 22 }}>Administrar os tipos</h1>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: 14 }}>
              Uploads vão para: <b>/public/{CONFIG[active].pasta}</b>.
            </p>
          </div>

          {/* Tabs principais + seletor de tipo */}
          <div style={{ padding: 14, display: 'flex', gap: 10, borderBottom: '1px solid #eee', background: '#fff' }}>
            {['adicionar', 'gerenciar'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setMainTab(t)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid #d0d7de',
                  background: mainTab === t ? PRIMARY_2 : '#fff',
                  color: mainTab === t ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                {t === 'adicionar' ? 'Adicionar' : 'Gerenciar'}
              </button>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {(['categoria', 'epoca', 'solo', 'sol']).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActive(t)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #d0d7de',
                    background: active === t ? LIGHT : '#fff',
                    color: '#111',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                  title={CONFIG[t].titulo}
                >
                  {CONFIG[t].titulo}
                </button>
              ))}
            </div>
          </div>

          {mainTab === 'adicionar' ? (
            <AdicionarTab
              active={active}
              cfg={cfg}
              forms={forms}
              loading={loading}
              fileRef={fileRef}
              handleChange={handleChange}
              handleUpload={handleUpload}
              abrirBusca={abrirBusca}
              salvar={salvar}
            />
          ) : (
            <GerenciarTab
              active={active}
              cfg={cfg}
              lista={lista}
              busyList={busyList}
              busca={busca}
              setBusca={setBusca}
              fetchLista={fetchLista}
              editId={editId}
              editObj={editObj}
              setEditObj={setEditObj}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              saveEdit={saveEdit}
              deleteRow={deleteRow}
            />
          )}
        </div>
      </div>

      {/* Modal de busca */}
      {mostrarBusca && (
        <div style={modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) setMostrarBusca(false); }}>
          <div style={{ ...modalBox, position: 'relative' }}>
            <button type="button" aria-label="Fechar" onClick={() => setMostrarBusca(false)} style={btnClose}>×</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingRight: 28 }}>
              <h3 style={{ margin: 0 }}>Arquivos em /{cfg.pasta}</h3>
            </div>
            <input type="text" value={filtro} onChange={(e)=>setFiltro(e.target.value)} placeholder="Filtrar por nome…" style={{ ...inputStyle, marginBottom: 12 }} />
            <div style={{ maxHeight: 420, overflow: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
              {arquivos
                .filter(a => a.toLowerCase().includes(filtro.trim().toLowerCase()))
                .map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', borderBottom: '1px dashed #eee' }}>
                    <img src={a} alt={a} style={{ width: 44, height: 44, objectFit: 'cover', border: '1px solid #ddd', borderRadius: 6 }} />
                    <div style={{ flex: 1, fontSize: 13, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a}</div>
                    <button type="button" style={btnPri} onClick={()=>selecionarArquivo(a)}>Usar</button>
                  </div>
                ))}
              {arquivos.length === 0 && <div style={{ padding: 12, textAlign: 'center', color: '#777' }}>Nenhum arquivo listado.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- SUBCOMPONENTES ----------------- */
function AdicionarTab({ active, cfg, forms, loading, fileRef, handleChange, handleUpload, abrirBusca, salvar }) {
  return (
    <div style={{ padding: 20, background: LIGHT }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontWeight: 700 }}>Nome *</label>
          <input
            type="text"
            value={forms[active].nome || ''}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder={active === 'epoca' ? 'Ex.: Primavera' : active === 'categoria' ? 'Ex.: Flor' : 'Ex.: Arenoso / Sol pleno'}
            style={inputStyle}
          />
        </div>

        {(active === 'solo' || active === 'sol') && (
          <div>
            <label style={{ fontWeight: 700 }}>Observação (opcional)</label>
            <input
              type="text"
              value={forms[active].observacao || ''}
              onChange={(e) => handleChange('observacao', e.target.value)}
              placeholder={active === 'solo' ? 'Ex.: Drena rápido, pouca retenção' : 'Ex.: Mínimo de 4h de sol direto'}
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontWeight: 700 }}>URL / Imagem (opcional)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10 }}>
            <input
              type="text"
              value={forms[active].url || ''}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder={`Ex.: /${cfg.pasta}/icone.png`}
              style={inputStyle}
            />
            <button type="button" onClick={abrirBusca} style={btnSec}>Pesquisar</button>
            <button type="button" onClick={() => fileRef.current?.click()} style={btnPri}>Upload</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <BotaoAcao label={loading ? 'Salvando...' : `Salvar ${cfg.titulo}`} tipo="confirmar" onClick={salvar} disabled={loading} />
        <BotaoAcao label="Limpar" tipo="perigo" onClick={() => window.location.reload()} />
      </div>
    </div>
  );
}

function GerenciarTab({
  active, cfg, lista, busyList, busca, setBusca,
  fetchLista, editId, editObj, setEditObj, startEdit, cancelEdit, saveEdit, deleteRow
}) {
  const mostraObs = (active === 'solo' || active === 'sol');

  const filtrados = lista.filter(row => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return (
      String(row.nome || '').toLowerCase().includes(q) ||
      String(row.observacao || '').toLowerCase().includes(q) ||
      String(row.url || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: 18, background: '#fff' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <input value={busca} onChange={(e)=>setBusca(e.target.value)} placeholder="Buscar por nome/observação/url…" style={{ ...inputStyle, maxWidth: 420 }} />
        <button onClick={fetchLista} style={btnSec}>Atualizar</button>
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `80px 1fr ${mostraObs ? '1fr ' : ''}1fr 220px`, background: LIGHT, fontWeight: 700, padding: '10px 12px' }}>
          <div>ID</div><div>Nome</div>{mostraObs && <div>Observação</div>}<div>URL</div><div style={{ textAlign: 'right' }}>Ações</div>
        </div>

        {busyList ? (
          <div style={{ padding: 16 }}>Carregando…</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: 16, color: '#666' }}>Nenhum registro encontrado.</div>
        ) : (
          filtrados.map((row) => {
            const editing = editId === row.id;
            return (
              <div key={row.id} style={{ display: 'grid', gridTemplateColumns: `80px 1fr ${mostraObs ? '1fr ' : ''}1fr 220px`, alignItems: 'center', padding: '10px 12px', borderTop: '1px solid #eee', gap: 8 }}>
                <div style={{ color: '#555' }}>{row.id}</div>

                <div>
                  {editing ? (
                    <input value={editObj.nome} onChange={(e)=>setEditObj(p=>({...p, nome: e.target.value}))} style={inputStyle} />
                  ) : <div>{row.nome}</div>}
                </div>

                {mostraObs && (
                  <div>
                    {editing ? (
                      <input value={editObj.observacao ?? ''} onChange={(e)=>setEditObj(p=>({...p, observacao: e.target.value}))} style={inputStyle} />
                    ) : <div style={{ color: '#444' }}>{row.observacao || <i style={{ color:'#999' }}>—</i>}</div>}
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                  {editing ? (
                    <input value={editObj.url ?? ''} onChange={(e)=>setEditObj(p=>({...p, url: e.target.value}))} style={inputStyle} placeholder={`/${cfg.pasta}/icone.png`} />
                  ) : (
                    <>
                      {row.url ? <img src={row.url} alt="" style={{ width: 32, height: 32, objectFit:'cover', border:'1px solid #ddd', borderRadius:6 }} /> : null}
                      <span style={{ fontSize: 12, color:'#555' }}>{row.url || <i style={{ color:'#999' }}>—</i>}</span>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {!editing ? (
                    <>
                      <button style={btnSec} onClick={() => startEdit(row)}>Editar</button>
                      <button style={{ ...btnSec, borderColor:'#b91c1c', color:'#b91c1c' }} onClick={() => deleteRow(row.id)}>Excluir</button>
                    </>
                  ) : (
                    <>
                      <button style={btnPri} onClick={() => saveEdit(row.id)}>Salvar</button>
                      <button style={btnSec} onClick={cancelEdit}>Cancelar</button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ----------------- ESTILOS ----------------- */
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd', outline: 'none', backgroundColor: '#fff', fontSize: 14 };
const btnPri = { padding: '10px 14px', borderRadius: 10, border: `1px solid ${PRIMARY_2}`, background: PRIMARY_2, color: '#fff', cursor: 'pointer', fontWeight: 700 };
const btnSec = { padding: '10px 14px', borderRadius: 10, border: '1px solid #d0d7de', background: '#fff', color: '#111', cursor: 'pointer', fontWeight: 700 };

const modalBackdrop = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalBox = { width: 'min(760px, 92vw)', background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' };

const btnClose = {
  position: 'absolute',
  top: 8,
  right: 10,
  width: 36,
  height: 36,
  textAlign: 'center',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  background: '#fff',
  color: '#111',
  fontSize: 24,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
};

export default ModeracaoAdicionarTipos;
