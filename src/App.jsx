import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import BarraLateral from './components/BarraLateral';
import PaginaUsuarios from './pages/PaginaUsuarios';
import PaginaBairros from './pages/PaginaBairros';
import PaginaTiposImoveis from './pages/PaginaTiposImoveis';
import PaginaImoveis from './pages/PaginaImoveis';
import PaginaFotos from './pages/PaginaFotos';
import PaginaHome from './pages/PaginaHome';
import PaginaDetalheImovel from './pages/PaginaDetalheImovel';
import PaginaLogin from './pages/PaginaLogin';

const PrivateLayout = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <BarraLateral />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

const PublicLayout = () => {
  return (
    <div style={{ width: '100%' }}>
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PaginaHome />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/imovel/:id" element={<PaginaDetalheImovel />} />
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateLayout />}>
        <Route path="/imoveis" element={<PaginaImoveis />} />
        <Route path="/usuarios" element={<PaginaUsuarios />} />
        <Route path="/bairros" element={<PaginaBairros />} />
        <Route path="/tipos" element={<PaginaTiposImoveis />} />
        <Route path="/fotos" element={<PaginaFotos />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
