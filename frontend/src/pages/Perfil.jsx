import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topo from '../components/Topo';

// Ícones simples para demonstração (você pode substituir por SVGs ou uma biblioteca de ícones)
const IconePerfil = () => <span style={{ fontSize: '1.2em' }}>👤</span>;
const IconeDocumento = () => <span style={{ fontSize: '1.2em' }}>📄</span>;
const IconeConfig = () => <span style={{ fontSize: '1.2em' }}>⚙️</span>;
const IconeLogin = () => <span style={{ fontSize: '1.2em' }}>🔑</span>;
const IconeFavoritos = () => <span style={{ fontSize: '1.5rem', color: '#ff6961' }}>❤</span>;
const IconePostagens = () => <span style={{ fontSize: '1.5rem', color: '#2c7be5' }}>✍️</span>;

function Perfil() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [status, setStatus] = useState('');
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [totalFavoritos, setTotalFavoritos] = useState(0); 
  const [totalPostagens, setTotalPostagens] = useState(0); 
  const [erroApi, setErroApi] = useState('');
  
  const navigate = useNavigate();

  const atividadesRecentes = [
    { id: 1, texto: 'Perfil atualizado', tipo: 'profile', icone: <IconePerfil /> },
    { id: 2, texto: 'Documento enviado', tipo: 'document', icone: <IconeDocumento /> },
    { id: 3, texto: 'Configurações alteradas', tipo: 'settings', icone: <IconeConfig /> },
    { id: 4, texto: 'Login realizado', tipo: 'login', icone: <IconeLogin /> },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        navigate('/');
        return;
    }

    const idUsuario = user.id;

    setNome(user.nome || 'Nome do Usuário');
    setEmail(user.email || 'email@exemplo.com');
    setCargo(user.role || 'Usuário Padrão');
    setStatus(user.status || 'Ativo');

    const buscarDadosDoBackend = async () => {
        setErroApi('');
        try {
            const [favoritosRes, postagensRes] = await Promise.all([
                fetch(`http://localhost:5000/api/favoritos/contagem/${idUsuario}`),
                fetch(`http://localhost:5000/api/conteudos/contagem/${idUsuario}`)
            ]);

            if (!favoritosRes.ok || !postagensRes.ok) {
                throw new Error('Erro ao carregar dados do servidor.');
            }

            const favoritosData = await favoritosRes.json();
            const postagensData = await postagensRes.json();

            setTotalFavoritos(favoritosData.totalFavoritos || 0);
            setTotalPostagens(postagensData.totalPostagens || 0);

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setErroApi('Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.');
        }
    };

    buscarDadosDoBackend();

  }, [navigate]);

  const handleSalvar = (e) => {
    e.preventDefault();
    setMensagem('');

    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const usuarioAtualizado = { ...user, nome, email, role: cargo, status: status };
      localStorage.setItem('user', JSON.stringify(usuarioAtualizado));
      setEditando(false);
      setMensagem('Informações atualizadas com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    }
  };

  const deslogar = () => {
    localStorage.clear();
    navigate('/');
  };

  const Tag = ({ text, color, bgColor }) => (
    <span style={{
      padding: '4px 8px',
      borderRadius: '5px',
      backgroundColor: bgColor || '#e0e0e0',
      color: color || '#333',
      fontSize: '0.8em',
      fontWeight: 'bold',
      marginRight: '5px'
    }}>
      {text}
    </span>
  );

  return (
    <div style={styles.pagina}>
      <Topo />
      <div style={styles.mainContent}>
        <div style={styles.leftColumn}>
          <div style={styles.profileCard}>
            <img src="/user-avatar.png" alt="Avatar do Usuário" style={styles.avatar} />
            {editando ? (
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={styles.nomeInput}
              />
            ) : (
              <h2 style={styles.userName}>{nome}</h2>
            )}

            <div style={styles.tagsContainer}>
              {editando ? (
                <select value={cargo} onChange={(e) => setCargo(e.target.value)} style={styles.selectInput}>
                  <option value="Administrador">Administrador</option>
                  <option value="Usuário Padrão">Usuário Padrão</option>
                </select>
              ) : (
                <Tag text={cargo} bgColor="#e7f0ff" color="#2c7be5" />
              )}
              {editando ? (
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.selectInput}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              ) : (
                <Tag text={status} bgColor="#d4edda" color="#28a745" />
              )}
            </div>

            {editando && (
              <div style={styles.emailEdit}>
                <label style={styles.labelInput}>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.inputField}
                />
              </div>
            )}
            
            <div style={styles.contactIcons}>
              <span style={styles.iconItem}>✉️</span>
              <span style={styles.iconItem}>📞</span>
              <span style={styles.iconItem}>📍</span>
              <span style={styles.iconItem}>🗓️</span>
            </div>

            <div style={styles.profileButtons}>
              {editando ? (
                <button onClick={handleSalvar} style={styles.editButton}>Salvar Perfil</button>
              ) : (
                <button onClick={() => setEditando(true)} style={styles.editButton}>✏️ Editar Perfil</button>
              )}
              <button style={styles.settingsButton}>⚙️</button>
            </div>
            <button onClick={deslogar} style={styles.logoutButton}>Sair</button>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statNumber}>{totalFavoritos}</span>
                <span style={styles.statLabel}>Favoritos</span>
              </div>
              <IconeFavoritos />
            </div>

            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statNumber}>{totalPostagens}</span>
                <span style={styles.statLabel}>Postagens</span>
              </div>
              <IconePostagens />
            </div>
          </div>

          <div style={styles.activitiesCard}>
            <h3 style={styles.activitiesTitle}>Atividades Recentes</h3>
            {mensagem && <p style={styles.mensagemSucesso}>{mensagem}</p>}
            {erroApi && <p style={styles.mensagemErro}>{erroApi}</p>}
            {atividadesRecentes.map((activity, index) => (
              <div key={activity.id} style={{
                ...styles.activityItem,
                borderBottom: index === atividadesRecentes.length - 1 ? 'none' : '1px solid #eee'
              }}>
                <div style={styles.activityIcon}>{activity.icone}</div>
                <span style={styles.activityText}>{activity.texto}</span>
                <Tag text={activity.tipo} bgColor={
                  activity.tipo === 'profile' ? '#ffe0b2' :
                  activity.tipo === 'document' ? '#c8e6c9' :
                  activity.tipo === 'settings' ? '#e1bee7' :
                  activity.tipo === 'login' ? '#bbdefb' : '#e0e0e0'
                } color={
                  activity.tipo === 'profile' ? '#e65100' :
                  activity.tipo === 'document' ? '#2e7d32' :
                  activity.tipo === 'settings' ? '#6a1b9a' :
                  activity.tipo === 'login' ? '#1565c0' : '#333'
                } />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pagina: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f1f1f1',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    padding: '20px',
    gap: '30px',
    marginTop: '60px',
  },
  leftColumn: {
    flex: '1',
    maxWidth: '350px',
    minWidth: '280px',
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '20px',
    border: '4px solid #2d6a4f',
  },
  userName: {
    fontSize: '1.8rem',
    margin: '10px 0 5px 0',
    color: '#333',
  },
  nomeInput: {
    fontSize: '1.8rem',
    margin: '10px 0 5px 0',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '5px 10px',
    textAlign: 'center',
  },
  tagsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  selectInput: {
    padding: '5px 10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '0.9em',
    backgroundColor: '#f9f9f9',
  },
  emailEdit: {
      width: '100%',
      textAlign: 'left',
      marginBottom: '15px',
      marginTop: '10px',
  },
  labelInput: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '5px',
      display: 'block',
  },
  inputField: {
      width: 'calc(100% - 20px)',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      backgroundColor: '#f9f9f9',
  },
  contactIcons: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    fontSize: '1.5rem',
    color: '#666',
  },
  iconItem: {
    cursor: 'pointer',
  },
  profileButtons: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    marginBottom: '20px',
  },
  editButton: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#2c7be5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  settingsButton: {
    width: '50px',
    padding: '12px',
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#d62828',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
    transition: 'background-color 0.3s',
  },
  rightColumn: {
    flex: '2',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
  },
  statChange: {
    fontSize: '0.9rem',
    color: '#28a745',
  },
  activitiesCard: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  activitiesTitle: {
    fontSize: '1.5rem',
    marginBottom: '25px',
    color: '#333',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  activityIcon: {
    fontSize: '1.5rem',
    marginRight: '15px',
    color: '#666',
  },
  activityText: {
    flex: 1,
    fontSize: '1rem',
    color: '#555',
  },
  tagStyle: {
    padding: '4px 8px',
    borderRadius: '5px',
    fontSize: '0.8em',
    fontWeight: 'bold',
    marginLeft: '10px',
  },
  mensagemSucesso: {
    color: '#2d6a4f',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  mensagemErro: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center',
  }
};

export default Perfil;