import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function PaginaBairros() {
  const [modo, setModo] = useState('lista');
  const [bairros, setBairros] = useState([]);
  const [formulario, setFormulario] = useState({ nome: '', cidade: 'Panambi', estado: 'RS' });
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = user.role === 'admin' || user.role === 'corretor';
  const canDelete = user.role === 'admin';
  const canCreate = user.role === 'admin' || user.role === 'corretor';

  useEffect(() => {
    carregarBairros();
  }, []);

  const carregarBairros = async () => {
    try {
      setLoading(true);
      const dados = await api.get('/api/bairros');
      setBairros(dados);
    } catch (error) {
      console.error("Erro ao carregar bairros:", error);
      showToast('Erro ao carregar bairros. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const salvarBairro = async (e) => {
    e.preventDefault();
    
    if (!formulario.nome.trim()) {
      showToast('O campo Nome do Bairro é obrigatório', 'error');
      return;
    }
    if (!formulario.cidade.trim()) {
      showToast('O campo Cidade é obrigatório', 'error');
      return;
    }
    if (!formulario.estado.trim()) {
      showToast('O campo Estado é obrigatório', 'error');
      return;
    }
    
    try {
      if (formulario.id) {
        await api.put(`/api/bairros/${formulario.id}`, formulario);
        showToast('Bairro atualizado com sucesso!', 'success');
      } else {
        await api.post('/api/bairros', formulario);
        showToast('Bairro cadastrado com sucesso!', 'success');
      }
      await carregarBairros();
      setModo('lista');
      setFormulario({ nome: '', cidade: 'Panambi', estado: 'RS' });
    } catch (error) {
      console.error('Erro ao salvar bairro:', error);
      showToast('Erro ao salvar bairro. Tente novamente.', 'error');
    }
  };
  
  const deletarBairro = async (id) => {
    if (confirm('Deseja remover este bairro?')) {
      try {
        await api.delete(`/api/bairros/${id}`);
        showToast('Bairro excluído com sucesso!', 'success');
        await carregarBairros();
      } catch (error) {
        console.error('Erro ao excluir bairro:', error);
        showToast('Erro ao excluir bairro. Tente novamente.', 'error');
      }
    }
  };

  const editarBairro = (bairro) => {
    setFormulario(bairro);
    setModo('formulario');
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Bairros</h1>
        {modo === 'lista' && canCreate && (
          <button 
            onClick={() => setModo('formulario')}
            className="btn btn-primary"
          >
            + Adicionar Bairro
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
        <Loading mensagem="Carregando bairros..." />
      ) : modo === 'lista' ? (
        <div className="grid-cards">
          {bairros.map((bairro) => (
            <div key={bairro.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{bairro.nome}</h3>
                {(canEdit || canDelete) && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {canEdit && (
                      <button onClick={() => editarBairro(bairro)} className="btn-icon" title="Editar">
                        <Pencil size={18} />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => deletarBairro(bairro.id)} className="btn-icon delete" title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{bairro.cidade} - {bairro.estado}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card form-container">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary)' }}>
            {formulario.id ? 'Editar Bairro' : 'Novo Bairro'}
          </h2>
          <form onSubmit={salvarBairro}>
            <div className="form-group">
              <label className="form-label">Nome do Bairro</label>
              <input 
                type="text" 
                required
                className="form-input"
                value={formulario.nome}
                onChange={e => setFormulario({...formulario, nome: e.target.value})}
                placeholder="Ex: Centro"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Cidade</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={formulario.cidade}
                  onChange={e => setFormulario({...formulario, cidade: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={formulario.estado}
                  onChange={e => setFormulario({...formulario, estado: e.target.value})}
                />
              </div>
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
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </>
  );
}

export default PaginaBairros;
