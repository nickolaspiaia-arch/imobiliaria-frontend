import React from 'react';
import Toast from './Toast';

/**
 * Container para gerenciar e exibir múltiplos toasts
 * @param {Array} toasts - Array de objetos toast com id, message e type
 * @param {function} onRemove - Callback para remover um toast
 */
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
