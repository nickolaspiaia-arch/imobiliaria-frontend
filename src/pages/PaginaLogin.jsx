import React, { useState } from 'react';
import api from '../services/api';

function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const user = await api.post('/login', { email, senha });
      localStorage.setItem('user', JSON.stringify(user));
      window.location.reload();
    } catch (error) {
      setErro('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--background)',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/Nipia.png" 
            alt="NiPia Logo" 
            style={{ height: '48px', marginBottom: '1rem' }} 
          />
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '300', 
            color: 'var(--primary)',
            letterSpacing: '1px'
          }}>
            Bem-vindo
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Entre para acessar o sistema
          </p>
        </div>

        {erro && (
          <div style={{ 
            backgroundColor: '#ffe5e5', 
            color: 'var(--danger)', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius)', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="seu@email.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input 
              type="password" 
              className="form-input"
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: 'var(--background)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Usuários de teste
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <div><strong>Admin:</strong> admin@nipia.com</div>
            <div><strong>Corretor:</strong> consultor@nipia.com</div>
            <div><strong>Cliente:</strong> cliente@nipia.com</div>
            <div>Senha (todos): 123456</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaginaLogin;
