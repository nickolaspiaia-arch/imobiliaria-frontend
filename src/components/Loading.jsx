import React from 'react';

function Loading({ mensagem = 'Carregando...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{mensagem}</p>
    </div>
  );
}

export default Loading;
