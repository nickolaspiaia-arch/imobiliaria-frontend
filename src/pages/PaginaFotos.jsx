import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Upload } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function PaginaFotos() {
  const [modo, setModo] = useState('lista');
  const [fotos, setFotos] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [formulario, setFormulario] = useState({ 
    capa: false, 
    ordem: 1,
    imovelId: ''
  });
  const [arquivo, setArquivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [fotosData, imoveisData] = await Promise.all([
        api.get('/api/fotos-imoveis'),
        api.get('/api/imoveis')
      ]);
      setImoveis(imoveisData);
      const visibleFotos = fotosData.filter(f => imoveisData.some(i => i.id === f.imovel?.id));
      setFotos(visibleFotos);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToast('Erro ao carregar dados. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const salvarFoto = async (e) => {
    e.preventDefault();
    
    if (!arquivo && !formulario.id) {
      alert('Selecione uma imagem para upload');
      return;
    }
    
    if (!formulario.imovelId) {
      alert('Selecione um imóvel');
      return;
    }

    try {
      setUploading(true);
      
      if (formulario.id) {
        const payload = {
          ...formulario,
          imovel: imoveis.find(i => i.id == formulario.imovelId)
        };
        await api.put(`/api/fotos-imoveis/${formulario.id}`, payload);
      } else {
        const formData = new FormData();
        formData.append('file', arquivo);
        formData.append('imovelId', formulario.imovelId);
        formData.append('capa', formulario.capa);
        formData.append('ordem', formulario.ordem);

        await api.upload('/api/fotos-imoveis/upload', formData);
      }
      
      await carregarDados();
      setModo('lista');
      setFormulario({ capa: false, ordem: 1, imovelId: '' });
      setArquivo(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      alert('Erro ao salvar foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deletarFoto = async (id) => {
    if (confirm('Deseja excluir esta foto?')) {
      try {
        await api.delete(`/api/fotos-imoveis/${id}`);
        showToast('Foto excluída com sucesso!', 'success');
        await carregarDados();
      } catch (error) {
        console.error('Erro ao excluir foto:', error);
        showToast('Erro ao excluir foto. Tente novamente.', 'error');
      }
    }
  };

  const editarFoto = (foto) => {
    setFormulario({
      id: foto.id,
      capa: foto.capa,
      ordem: foto.ordem,
      imovelId: foto.imovel?.id,
      caminho: foto.caminho,
      nomeArquivo: foto.nomeArquivo
    });
    setPreviewUrl(foto.caminho);
    setModo('formulario');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivo(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Galeria de Fotos</h1>
        {modo === 'lista' && (
          <button 
            onClick={() => setModo('formulario')}
            className="btn btn-primary"
          >
            + Adicionar Foto
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
        <Loading mensagem="Carregando fotos..." />
      ) : modo === 'lista' ? (
        <>
          <div className="grid-cards">
            {fotos.map((foto) => (
              <div key={foto.id} className="card">
                <div style={{ position: 'relative', aspectRatio: '1/1', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                  {foto.caminho ? (
                    <img 
                      src={foto.caminho} 
                      alt={foto.nomeArquivo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', backgroundColor: '#e5e7eb' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{foto.nomeArquivo}</span>
                      <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Imóvel: {foto.imovel?.titulo || 'N/A'}</span>
                    </div>
                  )}
                  {foto.capa && (
                    <span className="badge" style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: 'var(--primary)', color: 'var(--surface)' }}>
                      Capa
                    </span>
                  )}
                  <div className="card-actions-overlay">
                    <button 
                      onClick={() => editarFoto(foto)}
                      className="btn-icon"
                      title="Editar"
                      style={{ color: 'white' }}
                    >
                      <Pencil size={24} />
                    </button>
                    <button 
                      onClick={() => deletarFoto(foto.id)}
                      className="btn-icon delete"
                      title="Excluir"
                      style={{ color: 'white' }}
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {fotos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Nenhuma foto cadastrada. Clique em "+ Adicionar Foto" para começar.
            </div>
          )}
        </>
      ) : (
        <div className="card form-container">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary)' }}>
            {formulario.id ? 'Editar Foto' : 'Nova Foto'}
          </h2>
          <form onSubmit={salvarFoto}>
            {}
            {!formulario.id && (
              <div className="form-group">
                <label className="form-label">Selecionar Imagem</label>
                <div 
                  style={{ 
                    border: `2px dashed ${previewUrl ? 'var(--primary)' : 'var(--border)'}`, 
                    borderRadius: 'var(--radius)', 
                    padding: '1.5rem', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  {previewUrl ? (
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        style={{ maxHeight: '12rem', margin: '0 auto', borderRadius: 'var(--radius)', objectFit: 'contain' }}
                      />
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{arquivo?.name}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <Upload size={40} />
                      <p style={{ fontSize: '0.875rem' }}>Clique para selecionar uma imagem</p>
                      <p style={{ fontSize: '0.75rem' }}>JPG, PNG ou GIF (máx. 5MB)</p>
                    </div>
                  )}
                </div>
                <input 
                  id="fileInput"
                  type="file" 
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            )}

            {}
            {formulario.id && previewUrl && (
              <div className="form-group">
                <label className="form-label">Imagem Atual</label>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center' }}>
                  <img 
                    src={previewUrl} 
                    alt="Imagem atual" 
                    style={{ maxHeight: '12rem', margin: '0 auto', borderRadius: 'var(--radius)', objectFit: 'contain' }}
                  />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{formulario.nomeArquivo}</p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Imóvel</label>
              <select 
                required
                className="form-select"
                value={formulario.imovelId || ''}
                onChange={e => setFormulario({...formulario, imovelId: e.target.value})}
              >
                <option value="">Selecione um imóvel...</option>
                {imoveis.map(i => <option key={i.id} value={i.id}>{i.titulo}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button 
                type="button"
                onClick={() => {
                  setModo('lista');
                  setFormulario({ capa: false, ordem: 1, imovelId: '' });
                  setArquivo(null);
                  setPreviewUrl(null);
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={uploading}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: uploading ? 0.7 : 1 }}
              >
                {uploading ? (
                  <>
                    <div className="spinner-small"></div>
                    Enviando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </>
  );
}

export default PaginaFotos;
