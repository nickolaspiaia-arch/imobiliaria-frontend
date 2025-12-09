import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bed, Bath, Car, Maximize, MapPin, ArrowLeft, MessageCircle } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';

function PaginaDetalheImovel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imovel, setImovel] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fotoPrincipal, setFotoPrincipal] = useState(null);

  useEffect(() => {
    carregarDetalhes();
  }, [id]);

  const carregarDetalhes = async () => {
    try {
      setLoading(true);
      // Assuming GET /api/imoveis/:id returns the property details
      // And we need to fetch photos separately or they come with the property
      // Based on PaginaImoveis, photos are fetched separately.
      
      // Let's try to fetch specific property. If not available, we might need to filter from all.
      // But usually there is a specific endpoint.
      
      // Also fetching photos for this property
      const [imovelData, fotosData] = await Promise.all([
        api.get(`/api/imoveis/${id}`),
        api.get('/api/fotos-imoveis') // This fetches all photos, we filter client side as seen in PaginaImoveis
      ]);
      
      setImovel(imovelData);
      
      const fotosImovel = fotosData.filter(f => f.imovel?.id === parseInt(id));
      setFotos(fotosImovel);
      
      const capa = fotosImovel.find(f => f.capa);
      setFotoPrincipal(capa ? capa.caminho : (fotosImovel[0]?.caminho || null));
      
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      // Fallback if single get fails, try fetching all and finding
      try {
        const [imoveisData, fotosData] = await Promise.all([
            api.get('/api/imoveis'),
            api.get('/api/fotos-imoveis')
        ]);
        const found = imoveisData.find(i => i.id == id);
        if (found) {
            setImovel(found);
            const fotosImovel = fotosData.filter(f => f.imovel?.id === parseInt(id));
            setFotos(fotosImovel);
            const capa = fotosImovel.find(f => f.capa);
            setFotoPrincipal(capa ? capa.caminho : (fotosImovel[0]?.caminho || null));
        }
      } catch (e) {
          console.error("Erro no fallback:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Olá, gostaria de saber mais sobre o imóvel: ${imovel.titulo}`;
    const phoneNumber = "5597178810";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return <Loading mensagem="Carregando detalhes..." />;
  if (!imovel) return <div className="page-container">Imóvel não encontrado.</div>;

  return (
    <div className="page-container">
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="property-detail-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column - Images */}
        <div className="property-gallery">
          <div 
            className="main-image" 
            style={{ 
              width: '100%', 
              height: '400px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '0.5rem', 
              overflow: 'hidden',
              marginBottom: '1rem'
            }}
          >
            {fotoPrincipal ? (
              <img 
                src={fotoPrincipal} 
                alt={imovel.titulo} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                Sem Foto
              </div>
            )}
          </div>
          
          <div className="thumbnails" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
            {fotos.map(foto => (
              <div 
                key={foto.id}
                onClick={() => setFotoPrincipal(foto.caminho)}
                style={{ 
                  height: '80px', 
                  cursor: 'pointer', 
                  borderRadius: '0.25rem', 
                  overflow: 'hidden',
                  border: fotoPrincipal === foto.caminho ? '2px solid var(--primary)' : 'none'
                }}
              >
                <img 
                  src={foto.caminho} 
                  alt="Thumbnail" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="property-info">
          <div className="property-header" style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{imovel.titulo}</h1>
            <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', marginBottom: '1rem' }}>
              <MapPin size={18} style={{ marginRight: '0.5rem' }} />
              {imovel.endereco}, {imovel.numero} - {imovel.bairro?.nome}, {imovel.bairro?.cidade}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {imovel.finalidade === 'Aluguel' 
                ? `R$ ${imovel.precoAluguel || '0'}/mês` 
                : `R$ ${imovel.precoVenda || '0'}`}
            </div>
          </div>

          <div className="property-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <Bed size={24} style={{ marginBottom: '0.5rem', color: '#4b5563' }} />
              <div style={{ fontWeight: 'bold' }}>{imovel.dormitorios}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Dormitórios</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Bath size={24} style={{ marginBottom: '0.5rem', color: '#4b5563' }} />
              <div style={{ fontWeight: 'bold' }}>{imovel.banheiros}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Banheiros</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Car size={24} style={{ marginBottom: '0.5rem', color: '#4b5563' }} />
              <div style={{ fontWeight: 'bold' }}>{imovel.garagem}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Vagas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Maximize size={24} style={{ marginBottom: '0.5rem', color: '#4b5563' }} />
              <div style={{ fontWeight: 'bold' }}>{imovel.areaTotal}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>m²</div>
            </div>
          </div>

          <div className="property-description" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Descrição</h3>
            <p style={{ lineHeight: '1.6', color: '#374151' }}>{imovel.descricao}</p>
          </div>

          {imovel.caracteristicas && (
            <div className="property-features-list" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Características</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {imovel.caracteristicas.split(',').map((carac, index) => (
                  <span 
                    key={index}
                    style={{ 
                      backgroundColor: '#e5e7eb', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}
                  >
                    {carac.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={handleWhatsApp}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.125rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              backgroundColor: '#25D366',
              borderColor: '#25D366'
            }}
          >
            <MessageCircle size={24} />
            Comprar / Tenho Interesse
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaginaDetalheImovel;
