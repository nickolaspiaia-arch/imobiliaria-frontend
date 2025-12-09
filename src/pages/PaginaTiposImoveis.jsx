import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function PaginaTiposImoveis() {
  const [modo, setModo] = useState('lista');
  const [tipos, setTipos] = useState([]);
  const [formulario, setFormulario] = useState({ nome: '', descricao: '' });
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = user.role === 'admin' || user.role === 'corretor';
  const canDelete = user.role === 'admin';
  const canCreate = user.role === 'admin' || user.role === 'corretor';

  useEffect(() => {
    carregarTipos();
  }, []);

  const carregarTipos = async () => {
    try {
      setLoading(true);
      const dados = await api.get('/api/tipos-imoveis');
      setTipos(dados);
    } catch (error) {
      console.error("Erro ao carregar tipos:", error);
      showToast('Erro ao carregar tipos de imóveis. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const salvarTipo = async (e) => {
    e.preventDefault();
    
    if (!formulario.nome.trim()) {
      showToast('O campo Nome é obrigatório', 'error');
      return;
    }
    
    try {
      if (formulario.id) {
        await api.put(`/api/tipos-imoveis/${formulario.id}`, formulario);
        showToast('Tipo de imóvel atualizado com sucesso!', 'success');
      } else {
        await api.post('/api/tipos-imoveis', formulario);
        showToast('Tipo de imóvel cadastrado com sucesso!', 'success');
      }
      await carregarTipos();
      setModo('lista');
      setFormulario({ nome: '', descricao: '' });
    } catch (error) {
      console.error('Erro ao salvar tipo:', error);
      showToast('Erro ao salvar tipo de imóvel. Tente novamente.', 'error');
    }
  };

  const deletarTipo = async (id) => {
    if (confirm('Tem certeza que deseja excluir este tipo de imóvel?')) {
      try {
        await api.delete(`/api/tipos-imoveis/${id}`);
        showToast('Tipo de imóvel excluído com sucesso!', 'success');
        await carregarTipos();
      } catch (error) {
        console.error('Erro ao excluir tipo:', error);
        showToast('Erro ao excluir tipo de imóvel. Tente novamente.', 'error');
      }
    }
  };

  const editarTipo = (tipo) => {
    setFormulario(tipo);
    setModo('formulario');
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tipos de Imóvel</h1>
        {modo === 'lista' && canCreate && (
          <button 
            onClick={() => setModo('formulario')}
            className="btn btn-primary"
          >
            + Novo Tipo
          </button>
        )}
        {modo === 'formulario' && (
          <button 
            onClick={() => setModo('lista')}
            className="btn btn-secondary"
          >
            Voltar
          </button>
        )}
      </div>

      {loading ? (
        <Loading mensagem="Carregando tipos de imóvel..." />
      ) : modo === 'lista' ? (
        <div className="card">
          <ul style={{ listStyle: 'none' }}>
            {tipos.map((tipo) => (
              <li key={tipo.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>{tipo.nome}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{tipo.descricao}</p>
                </div>
                {(canEdit || canDelete) && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {canEdit && (
                      <button onClick={() => editarTipo(tipo)} className="btn-icon" title="Editar">
                        <Pencil size={18} />
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        onClick={() => deletarTipo(tipo.id)}
                        className="btn-icon delete"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card form-container">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary)' }}>
            {formulario.id ? 'Editar Tipo' : 'Novo Tipo'}
          </h2>
          <form onSubmit={salvarTipo}>
            <div className="form-group">
              <label className="form-label">Nome do Tipo</label>
              <input 
                type="text" 
                required
                className="form-input"
                value={formulario.nome}
                onChange={e => setFormulario({...formulario, nome: e.target.value})}
                placeholder="Ex: Apartamento, Casa, Terreno..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea 
                className="form-input"
                value={formulario.descricao}
                onChange={e => setFormulario({...formulario, descricao: e.target.value})}
                rows="3"
              />
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
                Salvar Tipo
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </>
  );
}

export default PaginaTiposImoveis;
