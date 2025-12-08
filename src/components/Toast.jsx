import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * @param {string} message
 * @param {string} type
 * @param {function} onClose
 * @param {number} duration
 */
function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const configs = {
    success: {
      icon: <CheckCircle size={20} />,
      className: 'toast-success'
    },
    error: {
      icon: <AlertCircle size={20} />,
      className: 'toast-error'
    },
    info: {
      icon: <Info size={20} />,
      className: 'toast-info'
    }
  };

  const config = configs[type] || configs.info;

  return (
    <div className={`toast ${config.className}`}>
      <div className="toast-icon">
        {config.icon}
      </div>
      <div className="toast-message">{message}</div>
      <button 
        onClick={onClose} 
        className="toast-close"
        aria-label="Fechar notificação"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default Toast;
