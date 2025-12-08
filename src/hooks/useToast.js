import { useState, useCallback } from 'react';

/**
 * @returns {Object}
 */
function useToast() {
  const [toasts, setToasts] = useState([]);

  /**
   * @param {string} message
   * @param {string} type 
   */
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  /**
   * @param {number} id
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast
  };
}

export default useToast;
