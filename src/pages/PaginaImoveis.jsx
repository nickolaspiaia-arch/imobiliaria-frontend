import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Bed, Bath, Car, Maximize, MapPin } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function PaginaImoveis() {
  const [modo, setModo] = useState('lista');
  
  const [bairros, setBairros] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = user.role === 'admin' || user.role === 'corretor';
  const canDelete = user.role === 'admin';
  const canCreate = user.role === 'admin' || user.role === 'corretor';

  const [formulario, setFormulario] = useState({
    titulo: '',
    precoVenda: '',
    precoAluguel: '',
    finalidade: 'Residencial',
    status: 'Ativo',
    dormitorios: '',
    banheiros: '',
    garagem: '',
    areaTotal: '',
    areaConstruida: '',
    endereco: '',
    numero: '',
    complemento: '',
    cep: '',
    bairro: null,
    tipoImovel: null,
    descricao: '',
    caracteristicas: '',
    destaque: false
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [imoveisData, bairrosData, tiposData, fotosData] = await Promise.all([
        api.get('/api/imoveis'),
        api.get('/api/bairros'),
        api.get('/api/tipos-imoveis'),
        api.get('/api/fotos-imoveis')
      ]);
      setImoveis(imoveisData);
      setBairros(bairrosData);
      setTipos(tiposData);
      setFotos(fotosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToast('Erro ao carregar dados. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFotoCapa = (imovelId) => {
    const fotosImovel = fotos.filter(f => f.imovel?.id === imovelId);
    const fotoCapa = fotosImovel.find(f => f.capa);
    return fotoCapa || fotosImovel[0] || null;
  };

  const salvarImovel = async (e) => {
    e.preventDefault();

    if (!formulario.titulo.trim()) {
      showToast('O campo Título é obrigatório', 'error');
      return;
    }
    if (!formulario.finalidade) {
      showToast('Selecione uma Finalidade', 'error');
      return;
    }
    if (!formulario.status) {
      showToast('Selecione um Status', 'error');
      return;
    }
    
    try {
      const payload = {
        ...formulario,
        bairro: bairros.find(b => b.id == formulario.bairroId),
        tipoImovel: tipos.find(t => t.id == formulario.tipoId)
      };

      if (formulario.id) {
        await api.put(`/api/imoveis/${formulario.id}`, payload);
        showToast('Imóvel atualizado com sucesso!', 'success');
      } else {
        await api.post('/api/imoveis', payload);
        showToast('Imóvel cadastrado com sucesso!', 'success');
      }
      await carregarDados();
      setModo('lista');
      setFormulario({ 
        titulo: '', 
        precoVenda: '', 
        precoAluguel: '',
        finalidade: 'Residencial',
        status: 'Ativo',
        dormitorios: '',
        banheiros: '',
        garagem: '',
        areaTotal: '', 
        areaConstruida: '',
        endereco: '',
        numero: '',
        complemento: '',
        cep: '',
        bairroId: '', 
        tipoId: '', 
        descricao: '',
        caracteristicas: '',
        destaque: false
      });
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      showToast('Erro ao salvar imóvel. Verifique os dados e tente novamente.', 'error');
    }
  };

  const deletarImovel = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        await api.delete(`/api/imoveis/${id}`);
        showToast('Imóvel excluído com sucesso!', 'success');
        await carregarDados();
      } catch (error) {
        console.error('Erro ao excluir imóvel:', error);
        showToast('Erro ao excluir imóvel. Tente novamente.', 'error');
      }
    }
  };

  const editarImovel = (imovel) => {
    setFormulario({
      ...imovel,
      bairroId: imovel.bairro?.id,
      tipoId: imovel.tipoImovel?.id,
      precoVenda: imovel.precoVenda || '',
      precoAluguel: imovel.precoAluguel || '',
      areaTotal: imovel.areaTotal || '',
      areaConstruida: imovel.areaConstruida || '',
      dormitorios: imovel.dormitorios || '',
      banheiros: imovel.banheiros || '',
      garagem: imovel.garagem || ''
    });
    setModo('formulario');
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Imóveis</h1>
        {modo === 'lista' && canCreate && (
          <button 
            onClick={() => setModo('formulario')}
            className="btn btn-primary"
          >
            + Novo Imóvel
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
        <Loading mensagem="Carregando imóveis..." />
      ) : modo === 'lista' ? (
        <div className="grid-cards">
          {imoveis.map((imovel) => {
            const fotoCapa = getFotoCapa(imovel.id);
            return (
              <div key={imovel.id} className="property-card">
                <div className="property-image-container">
                  {fotoCapa ? (
                    <img 
                      src={fotoCapa.caminho} 
                      alt={imovel.titulo}
                      className="property-image"
                    />
                  ) : (
                    <div className="property-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', color: '#9ca3af' }}>
                      <span style={{ fontSize: '0.875rem' }}>Sem Foto</span>
                    </div>
                  )}
                  
                  <div className="property-status-badge">
                    {imovel.finalidade}
                  </div>

                  {(canEdit || canDelete) && (
                    <div className="property-actions">
                      {canEdit && (
                        <button 
                          onClick={() => editarImovel(imovel)} 
                          className="property-action-btn" 
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => deletarImovel(imovel.id)} 
                          className="property-action-btn delete" 
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="property-content">
                  <div>
                    <div className="property-price">
                      {imovel.finalidade === 'Aluguel' 
                        ? `R$ ${imovel.precoAluguel || '0'}/mês` 
                        : `R$ ${imovel.precoVenda || '0'}`}
                    </div>
                    <h3 className="property-title">{imovel.titulo}</h3>
                    <div className="property-address">
                      <MapPin size={14} />
                      {imovel.bairro?.nome}, {imovel.bairro?.cidade}
                    </div>
                  </div>

                  <div className="property-features">
                    {imovel.dormitorios > 0 && (
                      <div className="property-feature" title="Dormitórios">
                        <Bed size={16} />
                        <span>{imovel.dormitorios}</span>
                      </div>
                    )}
                    {imovel.banheiros > 0 && (
                      <div className="property-feature" title="Banheiros">
                        <Bath size={16} />
                        <span>{imovel.banheiros}</span>
                      </div>
                    )}
                    {imovel.garagem > 0 && (
                      <div className="property-feature" title="Vagas">
                        <Car size={16} />
                        <span>{imovel.garagem}</span>
                      </div>
                    )}
                    <div className="property-feature" title="Área Total">
                      <Maximize size={16} />
                      <span>{imovel.areaTotal} m²</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card form-container">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary)' }}>Dados do Imóvel</h2>
          <form onSubmit={salvarImovel} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Título do Anúncio</label>
              <input 
                type="text" 
                required
                className="form-input"
                value={formulario.titulo}
                onChange={e => setFormulario({...formulario, titulo: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Finalidade</label>
              <select 
                className="form-select"
                value={formulario.finalidade || ''}
                onChange={e => setFormulario({...formulario, finalidade: e.target.value})}
              >
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={formulario.status || ''}
                onChange={e => setFormulario({...formulario, status: e.target.value})}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Vendido">Vendido</option>
                <option value="Alugado">Alugado</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Preço Venda (R$)</label>
              <input 
                type="number" 
                className="form-input"
                value={formulario.precoVenda}
                onChange={e => setFormulario({...formulario, precoVenda: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preço Aluguel (R$/mês)</label>
              <input 
                type="number" 
                className="form-input"
                value={formulario.precoAluguel}
                onChange={e => setFormulario({...formulario, precoAluguel: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Área Total (m²)</label>
              <input 
                type="number" 
                className="form-input"
                value={formulario.areaTotal}
                onChange={e => setFormulario({...formulario, areaTotal: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Área Construída (m²)</label>
              <input 
                type="number" 
                className="form-input"
                value={formulario.areaConstruida}
                onChange={e => setFormulario({...formulario, areaConstruida: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dormitórios</label>
              <input 
                type="number" 
                className="form-input"
                value={formulario.dormitorios}
                onChange={e => setFormulario({...formulario, dormitorios: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banheiros</label>
              <input 
                type="number" 
                className="form-input"
                value={formulario.banheiros}
                onChange={e => setFormulario({...formulario, banheiros: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vagas Garagem</label>
              <input 
                type="number" 
                className="form-input"
                value={formulario.garagem}
                onChange={e => setFormulario({...formulario, garagem: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bairro</label>
              <select 
                className="form-select"
                value={formulario.bairroId || ''}
                onChange={e => setFormulario({...formulario, bairroId: e.target.value})}
              >
                <option value="">Selecione...</option>
                {bairros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Imóvel</label>
              <select 
                className="form-select"
                value={formulario.tipoId || ''}
                onChange={e => setFormulario({...formulario, tipoId: e.target.value})}
              >
                <option value="">Selecione...</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Endereço</label>
              <input 
                type="text" 
                className="form-input"
                value={formulario.endereco || ''}
                onChange={e => setFormulario({...formulario, endereco: e.target.value})}
                placeholder="Rua, Avenida..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número</label>
              <input 
                type="text" 
                className="form-input"
                value={formulario.numero || ''}
                onChange={e => setFormulario({...formulario, numero: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Complemento</label>
              <input 
                type="text" 
                className="form-input"
                value={formulario.complemento || ''}
                onChange={e => setFormulario({...formulario, complemento: e.target.value})}
                placeholder="Apto, Bloco..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">CEP</label>
              <input 
                type="text" 
                className="form-input"
                value={formulario.cep || ''}
                onChange={e => setFormulario({...formulario, cep: e.target.value})}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Descrição Detalhada</label>
              <textarea 
                className="form-input"
                value={formulario.descricao || ''}
                onChange={e => setFormulario({...formulario, descricao: e.target.value})}
                style={{ height: '8rem', resize: 'none' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Características</label>
              <textarea 
                className="form-input"
                value={formulario.caracteristicas || ''}
                onChange={e => setFormulario({...formulario, caracteristicas: e.target.value})}
                placeholder="Piscina, Churrasqueira, Ar condicionado..."
                style={{ height: '6rem', resize: 'none' }}
              />
            </div>

            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
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
                Salvar Imóvel
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </>
  );
}

export default PaginaImoveis;
