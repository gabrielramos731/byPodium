import React, { useState } from 'react';
import { cancelEvent } from '../../utils/api/apiTaskManager';
import styles from './CancelEventModal.module.css';

function CancelEventModal({ isOpen, onClose, eventId, eventName, onEventCanceled }) {
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    if (!justificativa.trim()) {
      setError('Justificativa é obrigatória');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await cancelEvent(eventId, justificativa.trim());
      onEventCanceled();
      onClose();
    } catch (error) {
      console.error('Erro ao cancelar evento:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Erro ao cancelar evento. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setJustificativa('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Cancelar Evento</h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.warning}>
            <div className={styles.warningIcon}>⚠️</div>
            <div className={styles.warningText}>
              <strong>Atenção!</strong> Esta ação não pode ser desfeita.
            </div>
          </div>
          
          <p className={styles.eventInfo}>
            Você está prestes a cancelar o evento: <strong>"{eventName}"</strong>
          </p>
          
          <div className={styles.inputGroup}>
            <label htmlFor="justificativa" className={styles.label}>
              Justificativa para o cancelamento *
            </label>
            <textarea
              id="justificativa"
              value={justificativa}
              onChange={(e) => {
                setJustificativa(e.target.value);
                if (error) setError('');
              }}
              className={`${styles.textarea} ${error ? styles.inputError : ''}`}
              placeholder="Explique o motivo do cancelamento do evento..."
              rows="4"
              disabled={loading}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
          </div>

          <div className={styles.consequences}>
            <h4 className={styles.consequencesTitle}>Consequências do cancelamento:</h4>
            <ul className={styles.consequencesList}>
              <li>Todos os participantes inscritos serão notificados</li>
              <li>O evento será removido da listagem pública</li>
              <li>Esta ação não poderá ser revertida</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footer}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelButton}
            disabled={loading}
          >
            Manter Evento
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.confirmButton}
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelEventModal;
