import React, { useState } from 'react';
import styles from './ConfirmationModal.module.css';

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  eventData, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'default', // 'approve' ou 'reject'
  requiresFeedback = false
}) {
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    // Se requer feedback (negação) e está vazio
    if (requiresFeedback && !feedback.trim()) {
      setFeedbackError('O feedback é obrigatório para negar um evento.');
      return;
    }
    
    setFeedbackError('');
    onConfirm(feedback.trim());
  };

  const handleClose = () => {
    setFeedback('');
    setFeedbackError('');
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={`${styles.modalTitle} ${styles[type]}`}>
            {title}
          </h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>
          
          {eventData && (
            <div className={styles.eventInfo}>
              <h3 className={styles.eventInfoTitle}>Informações do Evento:</h3>
              <div className={styles.eventDetails}>
                <p><strong>Nome:</strong> {eventData.nome}</p>
                <p><strong>Organizador:</strong> {eventData.organizador}</p>
                <p><strong>Status Atual:</strong> 
                  <span className={styles.statusBadge}>
                    {eventData.status_atual}
                  </span>
                </p>
                <p><strong>Nova Ação:</strong> 
                  <span className={`${styles.statusBadge} ${styles[type]}`}>
                    {eventData.status_novo === 'ativo' ? 'Aprovar' : 'Negar'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {requiresFeedback && (
            <div className={styles.feedbackSection}>
              <h3 className={styles.feedbackTitle}>
                📝 Feedback da Administração <span className={styles.required}>*</span>
              </h3>
              <p className={styles.feedbackDescription}>
                Explique o motivo da negação. Este feedback será enviado por email para o organizador.
              </p>
              <textarea
                className={`${styles.feedbackTextarea} ${feedbackError ? styles.error : ''}`}
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  if (feedbackError) setFeedbackError('');
                }}
                placeholder="Ex: O evento não atende aos critérios de qualidade da plataforma. Por favor, revise a descrição e adicione mais detalhes sobre as atividades..."
                rows={4}
                maxLength={1000}
              />
              <div className={styles.textareaInfo}>
                <span className={styles.charCount}>{feedback.length}/1000</span>
                {feedbackError && <span className={styles.errorText}>{feedbackError}</span>}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton}
            onClick={handleClose}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.confirmButton} ${styles[type]}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
