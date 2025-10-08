// frontend/src/pages/Perfil.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Topo from '../components/Topo';

const IconeFavoritos = () => <span style={{ fontSize: '1.5rem', color: '#ff6961' }}>❤</span>;
const IconePostagens = () => <span style={{ fontSize: '1.5rem', color: '#2c7be5' }}>✍️</span>;

/* ===== Modal reutilizável ===== */
function Modal({ title, open, onClose, children, onSubmit, submitText = 'Salvar' }) {
  if (!open) return null;
  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.container} onClick={(e) => e.stopPropagation()}>
        <div style={m.header}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={m.closeBtn}>×</button>
        </div>
        <div style={m.body}>{children}</div>
        <div style={m.footer}>
          <button onClick={onClose} style={m.cancel}>Cancelar</button>
          <button onClick={onSubmit} style={m.save}>{submitText}</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Popup de sucesso ===== */
function SuccessPopup({ open, text }) {
  if (!open) return null;
  return (
    <div style={toast.overlay}>
      <div style={toast.card}>
        <div style={toast.icon}>✅</div>
        <div style={toast.text}>{text || 'Feito!'}</div>
      </div>
    </div>
  );
}

const REDIRECT_ON_SUCCESS = true;
const REDIRECT_PATH = '/perfil';

function Perfil() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState(''); // tipo
  const [fotoPerfil, setFotoPerfil] = useState('');

  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [totalPostagens, setTotalPostagens] = useState(0);

  const [erroApi, setErroApi] = useState('');
  const [carregando, setCarregando] = useState(false);

  // modais
  const [openEmail, setOpenEmail] = useState(false);
  const [openTelefone, setOpenTelefone] = useState(false);
  const [openEndereco, setOpenEndereco] = useState(false);
  const [openSenha, setOpenSenha] = useState(false);

  // sucesso
  const [successOpen, setSuccessOpen] = useState(false);
  const [successText, setSuccessText] = useState('');

  // contato
  const [numeroCelular, setNumeroCelular] = useState('');
  const [enderecoRua, setEnderecoRua] = useState('');
  const [enderecoNum, setEnderecoNum] = useState('');
  const [enderecoBairro, setEnderecoBairro] = useState('');
  const [enderecoCep, setEnderecoCep] = useState('');

  // senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const navigate = useNavigate();
  const API_BASE = useMemo(() => process.env.REACT_APP_API_BASE || 'http://localhost:5000', []);
  const fileInputRef = useRef(null);

  const resolveImgSrc = (valor) => {
    if (!valor) return `${API_BASE}/uploads/no-image.png`;
    if (/^https?:\/\//i.test(valor)) return valor;
    return `${API_BASE}${valor}`;
  };

  useEffect(() => {
    const userLS = JSON.parse(localStorage.getItem('user'));
    if (!userLS || !userLS.id) { navigate('/'); return; }
    const idUsuario = userLS.id;

    setNome(userLS.nome || 'Nome do Usuário');
    setEmail(userLS.email || '');
    setCargo(userLS.role || userLS.tipo || 'Usuário Padrão');
    setFotoPerfil(userLS.foto_perfil || '');
    setNumeroCelular(userLS.numero_celular || '');
    setEnderecoRua(userLS.endereco_rua || '');
    setEnderecoNum(userLS.endereco_num || '');
    setEnderecoBairro(userLS.endereco_bairro || '');
    setEnderecoCep(userLS.endereco_cep || '');

    const ctrl = new AbortController();
    const carregar = async () => {
      setCarregando(true);
      try {
        const uRes = await fetch(`${API_BASE}/api/users/${idUsuario}`, { signal: ctrl.signal });
        if (uRes.ok) {
          const u = await uRes.json();
          setNome(u.nome ?? '');
          setEmail(u.email ?? '');
          setCargo(u.tipo ?? 'Usuário Padrão');
          setFotoPerfil(u.foto_perfil ?? '');
          setNumeroCelular(u.numero_celular ?? '');
          setEnderecoRua(u.endereco_rua ?? '');
          setEnderecoNum(u.endereco_num ?? '');
          setEnderecoBairro(u.endereco_bairro ?? '');
          setEnderecoCep(u.endereco_cep ?? '');
          localStorage.setItem('user', JSON.stringify({ ...userLS, ...u }));
        }
        const [favoritosRes, postagensRes] = await Promise.all([
          fetch(`${API_BASE}/api/favoritos/contagem/${idUsuario}`, { signal: ctrl.signal }),
          fetch(`${API_BASE}/api/conteudos/contagem/${idUsuario}`, { signal: ctrl.signal }),
        ]);
        if (favoritosRes.ok) setTotalFavoritos(Number((await favoritosRes.json())?.totalFavoritos) || 0);
        if (postagensRes.ok) setTotalPostagens(Number((await postagensRes.json())?.totalPostagens) || 0);
      } catch (err) {
        console.error(err);
        setErroApi('Não foi possível conectar ao servidor.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
    return () => ctrl.abort();
  }, [navigate, API_BASE]);

  const salvarNoLocalStorage = (patch) => {
    const atual = JSON.parse(localStorage.getItem('user')) || {};
    localStorage.setItem('user', JSON.stringify({ ...atual, ...patch }));
  };

  const handleSuccess = (texto) => {
    setSuccessText(texto || 'Alteração salva!');
    setSuccessOpen(true);
    setTimeout(() => {
      setSuccessOpen(false);
      if (REDIRECT_ON_SUCCESS) navigate(REDIRECT_PATH);
    }, 1000);
  };

  // submitters
  const submitEmail = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) return;
    try {
      const r = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error(await r.text());
      salvarNoLocalStorage({ email });
      setOpenEmail(false);
      handleSuccess('E-mail atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      setErroApi('Falha ao atualizar e-mail');
      setTimeout(() => setErroApi(''), 3000);
    }
  };

  const submitTelefone = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) return;
    try {
      const r = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_celular: numeroCelular }),
      });
      if (!r.ok) throw new Error(await r.text());
      salvarNoLocalStorage({ numero_celular: numeroCelular });
      setOpenTelefone(false);
      handleSuccess('Telefone atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      setErroApi('Falha ao atualizar telefone');
      setTimeout(() => setErroApi(''), 3000);
    }
  };

  const submitEndereco = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) return;
    try {
      const payload = {
        endereco_rua: enderecoRua || null,
        endereco_num: enderecoNum || null,
        endereco_bairro: enderecoBairro || null,
        endereco_cep: enderecoCep || null,
      };
      const r = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      salvarNoLocalStorage({
        endereco_rua: enderecoRua,
        endereco_num: enderecoNum,
        endereco_bairro: enderecoBairro,
        endereco_cep: enderecoCep,
      });
      setOpenEndereco(false);
      handleSuccess('Endereço atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      setErroApi('Falha ao atualizar endereço');
      setTimeout(() => setErroApi(''), 3000);
    }
  };

  const submitSenha = async () => {
    setErroSenha('');
    if (!senhaAtual || !novaSenha || !confirmaSenha) {
      setErroSenha('Preencha todos os campos.');
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setErroSenha('A confirmação não confere.');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) return;

    try {
      const r = await fetch(`${API_BASE}/api/users/${user.id}/senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
      });
      if (!r.ok) throw new Error(await r.text());
      setSenhaAtual(''); setNovaSenha(''); setConfirmaSenha('');
      setOpenSenha(false);
      handleSuccess('Senha alterada com sucesso!');
    } catch (e) {
      console.error(e);
      setErroSenha('Não foi possível alterar a senha. Verifique a senha atual.');
    }
  };

  // foto
  const abrirSeletorFoto = () => fileInputRef.current?.click();
  const aoSelecionarFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      setErroApi('Selecione um arquivo de imagem válido.');
      setTimeout(() => setErroApi(''), 3000);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) return;

    try {
      const fd = new FormData();
      fd.append('foto', file);
      const r = await fetch(`${API_BASE}/api/users/${user.id}/foto`, { method: 'PUT', body: fd });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      const novaUrl = data?.url;
      setFotoPerfil(novaUrl);
      salvarNoLocalStorage({ foto_perfil: novaUrl });
      handleSuccess('Foto de perfil atualizada!');
    } catch (err) {
      console.error(err);
      setErroApi('Erro ao enviar foto. Tente novamente.');
      setTimeout(() => setErroApi(''), 3000);
    } finally {
      e.target.value = '';
    }
  };

  const deslogar = () => { localStorage.clear(); navigate('/'); };

  // helpers
  const enderecoFmt = () => {
    const partes = [
      enderecoRua && `Rua: ${enderecoRua}`,
      enderecoNum && `Nº: ${enderecoNum}`,
      enderecoBairro && `Bairro: ${enderecoBairro}`,
      enderecoCep && `CEP: ${enderecoCep}`,
    ].filter(Boolean);
    return partes.join(' · ');
  };

  const infoList = [
    { id: 'email', icon: '📧', label: 'E-mail', value: email || 'Não informado', empty: !email, onClick: () => setOpenEmail(true) },
    { id: 'fone', icon: '📞', label: 'Telefone', value: numeroCelular || 'Não informado', empty: !numeroCelular, onClick: () => setOpenTelefone(true) },
    {
      id: 'end', icon: '📍', label: 'Endereço',
      value: (enderecoRua || enderecoNum || enderecoBairro || enderecoCep) ? enderecoFmt() : 'Não informado',
      empty: !(enderecoRua || enderecoNum || enderecoBairro || enderecoCep),
      onClick: () => setOpenEndereco(true)
    },
  ];

  const avatarSrc = resolveImgSrc(fotoPerfil);

  return (
    <div style={styles.pagina}>
      {/* Topo com menu lateral (hambúrguer) */}
      <Topo centralizado comMenu />

      <div style={styles.mainContent}>
        <div style={styles.leftColumn}>
          <div style={styles.profileCard}>
            <img src={avatarSrc} alt="Avatar do Usuário" style={styles.avatar} />
            <h2 style={styles.userName}>{nome}</h2>

            {/* Tipo em MAIÚSCULO */}
            <div style={styles.tagsContainer}>
              <span style={styles.badgeUpper}>{cargo}</span>
            </div>

            {/* Adicionar foto */}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={aoSelecionarFoto} style={{ display: 'none' }} />
            <button style={styles.photoButton} onClick={abrirSeletorFoto}>📷 Adicionar foto</button>

            {/* VOLTAR para /home */}
            <button style={styles.backButton} onClick={() => navigate('/home')}>
              ⬅ Voltar
            </button>

            {/* Mudar senha / sair */}
            <button style={styles.changePasswordButton} onClick={() => setOpenSenha(true)}>🔒 Mudar senha</button>
            <button onClick={deslogar} style={styles.logoutButton}>Sair</button>

            {erroApi && <p style={styles.mensagemErro}>{erroApi}</p>}
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statNumber}>{carregando ? '...' : totalFavoritos}</span>
                <span style={styles.statLabel}>Postagens favoritadas</span>
              </div>
              <IconeFavoritos />
            </div>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statNumber}>{carregando ? '...' : totalPostagens}</span>
                <span style={styles.statLabel}>Postagens feitas</span>
              </div>
              <IconePostagens />
            </div>
          </div>

          <div style={styles.activitiesCard}>
            <h3 style={styles.activitiesTitle}>Atividades Recentes</h3>
            {infoList.map((it, index) => (
              <div
                key={it.id}
                style={{
                  ...styles.activityItem,
                  borderBottom: index === infoList.length - 1 ? 'none' : '1px solid #eee',
                }}
              >
                <div style={styles.activityIcon}>{it.icon}</div>
                <div style={{ ...styles.activityText }}>
                  <strong>{it.label}</strong><br />
                  <span style={{ color: it.empty ? '#a6a6a6' : '#555' }}>{it.value}</span>
                </div>
                <button onClick={it.onClick} style={styles.swapButton}>Trocar informação</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modais */}
      <Modal title="Editar e-mail" open={openEmail} onClose={() => setOpenEmail(false)} onSubmit={submitEmail} submitText="Salvar e-mail">
        <label style={styles.labelInput}>E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.inputField} placeholder="ex: joao@email.com" />
      </Modal>

      <Modal title="Editar telefone" open={openTelefone} onClose={() => setOpenTelefone(false)} onSubmit={submitTelefone} submitText="Salvar telefone">
        <label style={styles.labelInput}>Número de celular</label>
        <input type="tel" value={numeroCelular} onChange={(e) => setNumeroCelular(e.target.value)} style={styles.inputField} placeholder="(11) 9 9999-9999" />
      </Modal>

      <Modal title="Editar endereço" open={openEndereco} onClose={() => setOpenEndereco(false)} onSubmit={submitEndereco} submitText="Salvar endereço">
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={styles.labelInput}>Rua</label>
            <input type="text" value={enderecoRua} onChange={(e) => setEnderecoRua(e.target.value)} style={styles.inputField} placeholder="Ex.: Av. Paulista" />
          </div>
          <div>
            <label style={styles.labelInput}>Número</label>
            <input type="text" value={enderecoNum} onChange={(e) => setEnderecoNum(e.target.value)} style={styles.inputField} placeholder="123" />
          </div>
          <div>
            <label style={styles.labelInput}>Bairro</label>
            <input type="text" value={enderecoBairro} onChange={(e) => setEnderecoBairro(e.target.value)} style={styles.inputField} placeholder="Centro" />
          </div>
          <div>
            <label style={styles.labelInput}>CEP</label>
            <input type="text" value={enderecoCep} onChange={(e) => setEnderecoCep(e.target.value)} style={styles.inputField} placeholder="00000-000" />
          </div>
        </div>
      </Modal>

      <Modal title="Mudar senha" open={openSenha} onClose={() => setOpenSenha(false)} onSubmit={submitSenha} submitText="Salvar nova senha">
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={styles.labelInput}>Senha atual</label>
            <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} style={styles.inputField} />
          </div>
          <div>
            <label style={styles.labelInput}>Nova senha</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} style={styles.inputField}/>
          </div>
          <div>
            <label style={styles.labelInput}>Confirmar nova senha</label>
            <input type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} style={styles.inputField} />
          </div>
          {erroSenha && (
            <div style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8 }}>
              {erroSenha}
            </div>
          )}
        </div>
      </Modal>

      <SuccessPopup open={successOpen} text={successText} />
    </div>
  );
}

/* ===== estilos ===== */
const styles = {
  pagina: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f1f1' },
  mainContent: { display: 'flex', flex: 1, padding: '20px', gap: '30px', marginTop: '60px' },
  leftColumn: { flex: '1', maxWidth: '350px', minWidth: '280px' },
  profileCard: {
    backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0,0,0,.1)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', marginBottom: '20px', position: 'relative'
  },
  avatar: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '4px solid #2d6a4f' },
  userName: { fontSize: '1.8rem', margin: '10px 0 5px 0', color: '#333' },

  badgeUpper: {
    padding: '4px 8px', borderRadius: '5px', backgroundColor: '#e7f0ff', color: '#2c7be5',
    fontSize: '0.8em', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 6
  },
  tagsContainer: { display: 'flex', gap: '10px', marginBottom: '10px' },

  /* === Botões em degradê (claro / médio / escuro) === */
  // Claro: "Adicionar foto"
  photoButton: {
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#95d5b2', // fallback
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    marginTop: 6,
    boxShadow: '0 6px 14px rgba(148, 214, 181, .35)',
    transition: 'transform .06s ease, filter .2s ease',
  },

  // Médio: "Voltar"
  backButton: {
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    marginTop: 8,
    boxShadow: '0 6px 14px rgba(45,106,79,.28)',
    transition: 'transform .06s ease, filter .2s ease',
  },

  // Escuro: "Mudar senha"
  changePasswordButton: {
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#1b4332',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    marginTop: 6,
    boxShadow: '0 6px 14px rgba(17,50,38,.40)',
    transition: 'transform .06s ease, filter .2s ease',
  },

  // Ação destrutiva mantém vermelho
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#d62828',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
    boxShadow: '0 6px 14px rgba(214,40,40,.25)',
  },
  
  rightColumn: { flex: '2', display: 'flex', flexDirection: 'column', gap: '30px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' },
  statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 5px rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' },
  statInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  statNumber: { fontSize: '1.8rem', fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: '0.9rem', color: '#666' },

  activitiesCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,.1)' },
  activitiesTitle: { fontSize: '1.5rem', marginBottom: '25px', color: '#333' },
  activityItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
  activityIcon: { fontSize: '1.3rem', marginRight: '6px', color: '#2d6a4f' },
  activityText: { flex: 1, fontSize: '1rem', color: '#555' },

  labelInput: { fontSize: '0.9rem', color: '#666', marginBottom: '5px', display: 'block' },
  inputField: {
    width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '1rem', backgroundColor: '#f9f9f9'
  },

  // Botão "Trocar informação" (médio/compacto)
  swapButton: {
    padding: '8px 12px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: '.85rem',
    fontWeight: 600,
    boxShadow: '0 6px 14px rgba(45,106,79,.25)',
    transition: 'transform .06s ease, filter .2s ease',
  },

  mensagemErro: { color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '5px', marginTop: '10px', width: '100%', textAlign: 'center' },
};

const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  container: { width: 'min(560px, 92vw)', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.2)', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #eee' },
  closeBtn: { background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', lineHeight: 1 },
  body: { padding: '20px 24px' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '20px 24px', borderTop: '1px solid #eee' },
  save: { background: '#2c7be5', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  cancel: { background: '#e0e0e0', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' },
};

const toast = {
  overlay: { position: 'fixed', inset: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1100 },
  card: { pointerEvents: 'auto', background: '#ffffff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 10px 30px rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', gap: 10 },
  icon: { fontSize: 22 },
  text: { fontWeight: 600, color: '#2d6a4f' }
};


export default Perfil;
