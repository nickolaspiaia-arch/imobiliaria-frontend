import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Bath, Car, Maximize, MapPin } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';

function PaginaHome() {
  const [imoveis, setImoveis] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const propertiesRef = useRef(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [imoveisData, fotosData] = await Promise.all([
        api.get('/api/imoveis'),
        api.get('/api/fotos-imoveis')
      ]);
      setImoveis(imoveisData);
      setFotos(fotosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFotoCapa = (imovelId) => {
    const fotosImovel = fotos.filter(f => f.imovel?.id === imovelId);
    const fotoCapa = fotosImovel.find(f => f.capa);
    return fotoCapa || fotosImovel[0] || null;
  };

  const scrollToProperties = () => {
    propertiesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div 
        className="hero-section"
        style={{
          backgroundImage: `url('https://images.tcdn.com.br/img/editor/up/1062397/CasaCearaCasaMaster_CERTA_5Photo.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          margin: '-2rem -2rem 2rem -2rem'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            Seja bem vindo à Imobiliária Nipia
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
            clique no botao abaixo para conhecer as propriedades disponíves
          </p>
          <button 
            onClick={scrollToProperties}
            className="btn btn-primary"
            style={{ fontSize: '1.2rem', padding: '12px 24px', marginBottom: '1rem' }}
          >
            Conhecer Propriedades
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '10px'
            }}
          >
            Fazer Login
          </button>
        </div>
      </div>

      {/* Properties Section */}
      <div ref={propertiesRef} className="page-container">
        <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Nossas Propriedades
        </h2>

        {loading ? (
          <Loading mensagem="Carregando imóveis..." />
        ) : (
          <div className="grid-cards">
            {imoveis.map((imovel) => {
              const fotoCapa = getFotoCapa(imovel.id);
              return (
                <div 
                  key={imovel.id} 
                  className="property-card"
                  onClick={() => navigate(`/imovel/${imovel.id}`)}
                  style={{ cursor: 'pointer' }}
                >
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
        )}
      </div>
    </div>
  );
}

export default PaginaHome;
