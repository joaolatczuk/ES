import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Topo from '../components/Topo';
import BotaoAcao from '../components/BotaoAcao';

const API = 'http://localhost:5000/api/admin';

function AdminUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null);
  const [loadingAcao, setLoadingAcao] = useState(null);
  const pageSize = 8;

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Proteção: apenas admin acessa
  useEffect(() => {
    if (!(user?.is_admin || user?.role === 'admin')) {
      navigate('/');
    }
  }, [navigate, user]);

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'x-admin': '1',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const fetchUsuarios = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch(`${API}/usuarios`, { headers });
      if (!res.ok) throw new Error('Falha ao carregar usuários.');
      const data = await res.json();
      setUsuarios(data || []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []); // eslint-disable-line

  const acao = async (url, method = 'PATCH', sucessoMsg = 'Operação realizada!') => {
    setErro('');
    setOk('');
    const res = await fetch(url, { method, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Erro na operação.');
    setOk(data?.message || sucessoMsg);
    await fetchUsuarios();
  };

  const confirmar = async ({ titulo, texto, confirmText = 'Confirmar', icon = 'warning' }) => {
    const r = await Swal.fire({
      icon,
      title: titulo,
      text: texto,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar'
    });
    return r.isConfirmed;
  };

  const bloquear = async (u) => {
    const ok = await confirmar({
      titulo: `Bloquear ${u.nome}?`,
      texto: 'O usuário não conseguirá acessar até ser reativado.',
      confirmText: 'Sim, bloquear'
    });
    if (!ok) return;

    try {
      setLoadingId(u.id);
      setLoadingAcao('bloquear');
      await acao(`${API}/usuarios/${u.id}/bloquear`, 'PATCH', 'Usuário bloqueado!');
      Swal.fire({ icon: 'success', title: 'Bloqueado!', text: `${u.nome} foi bloqueado.` });
    } catch (e) {
      setErro(e.message);
      Swal.fire({ icon: 'error', title: 'Erro', text: e.message });
    } finally {
      setLoadingId(null);
      setLoadingAcao(null);
    }
  };

  const ativar = async (u) => {
    const ok = await confirmar({
      titulo: `Ativar ${u.nome}?`,
      texto: 'O usuário poderá voltar a acessar o sistema.',
      confirmText: 'Sim, ativar',
      icon: 'question'
    });
    if (!ok) return;

    try {
      setLoadingId(u.id);
      setLoadingAcao('ativar');
      await acao(`${API}/usuarios/${u.id}/ativar`, 'PATCH', 'Usuário ativado!');
      Swal.fire({ icon: 'success', title: 'Ativado!', text: `${u.nome} foi reativado.` });
    } catch (e) {
      setErro(e.message);
      Swal.fire({ icon: 'error', title: 'Erro', text: e.message });
    } finally {
      setLoadingId(null);
      setLoadingAcao(null);
    }
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const arr = q
      ? usuarios.filter(
          (u) =>
            String(u.id).includes(q) ||
            (u.nome || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.status || '').toLowerCase().includes(q)
        )
      : usuarios;
    const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const slice = arr.slice(start, start + pageSize);
    return { slice, totalPages, safePage };
  }, [usuarios, busca, page]);

  useEffect(() => { setPage(1); }, [busca]);

  const badge = (status) => {
    const base = {
      padding: '2px 8px',
      borderRadius: '999px',
      fontSize: 12,
      fontWeight: 700,
      display: 'inline-block',
    };
    if (status === 'ativo') return { ...base, background: '#E8F5E9', border: '1px solid #2E7D32', color: '#1B5E20' };
    if (status === 'bloqueado') return { ...base, background: '#fde2e2', border: '1px solid #e03131', color: '#b71c1c' };
    return base;
  };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <Topo centralizado comMenu />
      </div>

      <div style={s.container}>
        <h2 style={s.h2}>Admin • Usuários</h2>

        <div style={s.toolbar}>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail, status..."
            style={s.input}
          />
          <BotaoAcao
            label={loading ? 'Recarregando...' : 'Recarregar'}
            tipo="primario"
            tamanho="padrao"
            carregando={loading}
            autoSuccess={false}
            onClick={() => fetchUsuarios()}
          />
        </div>

        {loading && <div style={s.info}>Carregando…</div>}
        {!!erro && <div style={{ ...s.info, ...s.error }}>{erro}</div>}
        {!!ok && <div style={{ ...s.info, ...s.success }}>{ok}</div>}

        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>Nome</th>
                <th style={s.th}>E-mail</th>
                <th style={s.th}>Admin</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.slice.map((u) => {
                const isLoadingRow = loadingId === u.id;
                return (
                  <tr key={u.id}>
                    <td style={s.td}>{u.id}</td>
                    <td style={s.td}>{u.nome}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>{u.is_admin ? 'Sim' : 'Não'}</td>
                    <td style={s.td}>
                      <span style={badge(u.status)}>{u.status}</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        {u.status === 'ativo' ? (
                          <BotaoAcao
                            label={isLoadingRow && loadingAcao === 'bloquear' ? 'Bloqueando...' : 'Bloquear'}
                            tipo="perigo"
                            tamanho="pequeno"
                            carregando={isLoadingRow && loadingAcao === 'bloquear'}
                            autoSuccess={false}
                            onClick={() => bloquear(u)}
                          />
                        ) : (
                          <BotaoAcao
                            label={isLoadingRow && loadingAcao === 'ativar' ? 'Ativando...' : 'Ativar'}
                            tipo="sucesso"
                            tamanho="pequeno"
                            carregando={isLoadingRow && loadingAcao === 'ativar'}
                            autoSuccess={false}
                            onClick={() => ativar(u)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtrados.slice.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#777' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={s.pagination}>
          <button
            disabled={filtrados.safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={s.pageBtn}
          >
            ‹ Anterior
          </button>
          <span style={s.pageLabel}>
            Página {filtrados.safePage} de {filtrados.totalPages}
          </span>
          <button
            disabled={filtrados.safePage >= filtrados.totalPages}
            onClick={() => setPage((p) => Math.min(filtrados.totalPages, p + 1))}
            style={s.pageBtn}
          >
            Próxima ›
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f1f1f1', paddingTop: 60 },
  topBar: { position: 'fixed', top: 0, left: 0, right: 0, background: '#fff', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,.08)' },
  container: { maxWidth: 1080, margin: '100px auto 40px', padding: 16 },
  h2: { margin: '8px 0 16px', color: '#1b4332' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' },
  input: { flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd', outline: 'none' },
  card: { background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: 12, background: '#ecf4ef', fontWeight: 700, borderBottom: '1px solid #e8e8e8' },
  td: { padding: 12, borderBottom: '1px solid #f2f2f2', verticalAlign: 'middle' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  info: { margin: '10px 0', padding: '10px 12px', borderRadius: 10, fontSize: 14 },
  error: { background: '#fde2e2', border: '1px solid #e03131', color: '#b71c1c' },
  success: { background: '#E8F5E9', border: '1px solid #2E7D32', color: '#1B5E20' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 },
  pageBtn: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '', cursor: 'pointer' },
  pageLabel: { fontSize: 14, color: '#444' },
};

export default AdminUsuarios;