import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function PaginaUsuarios() {
  const [modo, setModo] = useState('lista');
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState({ nome: '', email: '', senha: '', tipo: '' });
  const [loading, setLoading] = useState(true);

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const dados = await api.get('/api/usuarios');
      setUsuarios(dados);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      showToast('Erro ao carregar usuários. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    
    if (!formulario.nome.trim()) {
      showToast('O campo Nome é obrigatório', 'error');
      return;
    }
    if (!formulario.email.trim()) {
      showToast('O campo Email é obrigatório', 'error');
      return;
    }
    if (!formulario.id && !formulario.senha.trim()) {
      showToast('O campo Senha é obrigatório', 'error');
      return;
    }
    if (!formulario.tipo) {
      showToast('Selecione um Tipo de usuário', 'error');
      return;
    }
    
    try {
      if (formulario.id) {
        await api.put(`/api/usuarios/${formulario.id}`, formulario);
        showToast('Usuário atualizado com sucesso!', 'success');
      } else {
        await api.post('/api/usuarios', formulario);
        showToast('Usuário cadastrado com sucesso!', 'success');
      }
      await carregarUsuarios();
      setModo('lista');
      setFormulario({ nome: '', email: '', senha: '', tipo: '' });
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      showToast('Erro ao salvar usuário. Verifique os dados e tente novamente.', 'error');
    }
  };

  const deletarUsuario = async (id) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/api/usuarios/${id}`);
        showToast('Usuário excluído com sucesso!', 'success');
        await carregarUsuarios();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showToast('Erro ao excluir usuário. Tente novamente.', 'error');
      }
    }
  };

  const editarUsuario = (usuario) => {
    setFormulario(usuario);
    setModo('formulario');
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Gerenciar Usuários</h1>
        {modo === 'lista' && (
          <button 
            onClick={() => setModo('formulario')}
            className="btn btn-primary"
          >
            + Novo Usuário
          </button>
        )}
        {modo === 'formulario' && (
          <button 
            onClick={() => setModo('lista')}
            className="btn btn-secondary"
          >
            Voltar para Lista
          </button>
        )}
      </div>

      {loading ? (
        <Loading mensagem="Carregando usuários..." />
      ) : modo === 'lista' ? (
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nome}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{usuario.email}</td>
                  <td>
                    <span className="badge">
                      {usuario.tipo}
                    </span>
                  </td>
                  <td className="text-right">
                    <button onClick={() => editarUsuario(usuario)} className="btn-icon" title="Editar">
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => deletarUsuario(usuario.id)}
                      className="btn-icon delete"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card form-container">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary)' }}>Cadastrar Novo Usuário</h2>
          <form onSubmit={salvarUsuario}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input 
                type="text" 
                required
                className="form-input"
                value={formulario.nome}
                onChange={e => setFormulario({...formulario, nome: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Corporativo</label>
              <input 
                type="email" 
                required
                className="form-input"
                value={formulario.email}
                onChange={e => setFormulario({...formulario, email: e.target.value})}
              />
            </div>
            {!formulario.id && (
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input 
                  type="password" 
                  required
                  className="form-input"
                  value={formulario.senha}
                  onChange={e => setFormulario({...formulario, senha: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select 
                required
                className="form-select"
                value={formulario.tipo}
                onChange={e => setFormulario({...formulario, tipo: e.target.value})}
              >
                <option value="">Selecione um tipo...</option>
                <option value="administrador">Administrador</option>
                <option value="corretor">Corretor</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div className="form-actions">
              <button 
                type="button"
                onClick={() => setModo('lista')}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
              >
                Salvar Usuário
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </>
  );
}

export default PaginaUsuarios;
