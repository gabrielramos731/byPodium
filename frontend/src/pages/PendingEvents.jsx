import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import ConfirmationModal from '../components/confirmationModal/ConfirmationModal';
import { getPendingEvents, updateEventStatus } from '../utils/api/apiTaskManager';
import { formatDateToBR } from '../utils/dateUtils';
import mainImage from '../assets/main-image.jpg';
import styles from './PendingEvents.module.css';

function PendingEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingEvents, setUpdatingEvents] = useState(new Set());
  
  // Estados para o modal de confirmação
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    eventId: null,
    status: null,
    eventData: null,
    type: 'default',
    requiresFeedback: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const loadPendingEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const eventsData = await getPendingEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Erro ao carregar eventos pendentes:', error);
        if (error.response?.status === 403) {
          setError('Acesso negado. Você não tem permissão para visualizar eventos pendentes.');
        } else if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Erro ao carregar eventos pendentes. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadPendingEvents();
  }, [navigate]);

  const handleStatusUpdate = async (eventId, newStatus) => {
    // Verificar se já está atualizando este evento
    if (updatingEvents.has(eventId)) {
      return;
    }

    try {
      // Primeira tentativa - verificar se precisa de confirmação/feedback
      await updateEventStatus(eventId, newStatus, false);
      
      // Se chegou aqui, a operação foi bem-sucedida sem precisar de confirmação
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
    } catch (error) {
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        if (errorData.requires_feedback) {
          // Precisa de feedback para negação
          const event = events.find(e => e.id === eventId);
          setConfirmModal({
            isOpen: true,
            eventId: eventId,
            status: newStatus,
            eventData: {
              nome: event.nome,
              organizador: event.organizador_email,
              status_atual: 'pendente',
              status_novo: newStatus
            },
            type: 'reject',
            requiresFeedback: true
          });
        } else if (errorData.requires_confirmation) {
          // Precisa de confirmação
          setConfirmModal({
            isOpen: true,
            eventId: eventId,
            status: newStatus,
            eventData: errorData.evento,
            type: newStatus === 'ativo' ? 'approve' : 'reject',
            requiresFeedback: false
          });
        }
      } else {
        console.error('Erro ao atualizar status:', error);
        // Aqui você pode adicionar uma notificação de erro
      }
    }
  };

  const handleConfirmStatusUpdate = async (feedback = '') => {
    const { eventId, status } = confirmModal;
    
    try {
      // Adicionar evento ao conjunto de eventos sendo atualizados
      setUpdatingEvents(prev => new Set(prev).add(eventId));
      
      // Segunda tentativa com confirmação e feedback (se aplicável)
      const result = await updateEventStatus(eventId, status, true, feedback);
      
      // Remover o evento da lista após aprovação/negação
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      // Fechar modal
      setConfirmModal({
        isOpen: false,
        eventId: null,
        status: null,
        eventData: null,
        type: 'default',
        requiresFeedback: false
      });
      
      // Mostrar mensagem de sucesso (opcional)
      console.log(result.message);
      
    } catch (error) {
      console.error('Erro ao confirmar atualização de status:', error);
    } finally {
      // Remover evento do conjunto de eventos sendo atualizados
      setUpdatingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      eventId: null,
      status: null,
      eventData: null,
      type: 'default',
      requiresFeedback: false
    });
  };

  const handleEventClick = (eventId) => {
    navigate(`/evento/${eventId}`);
  };

  if (loading) {
    return (
      <div className={styles.pendingEventsContainer}>
        <Navigation />
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>Carregando eventos pendentes...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pendingEventsContainer}>
        <Navigation />
        <main className={styles.mainContent}>
          <div className={styles.errorContainer}>
            <div className={styles.error}>{error}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pendingEventsContainer}>
      <Navigation />
      
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Eventos Pendentes</h1>
          <p className={styles.pageSubtitle}>
            Analise e aprove/negue eventos criados pelos organizadores
          </p>
        </div>

        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Nenhum evento pendente</h2>
            <p className={styles.emptyText}>
              Todos os eventos foram analisados ou não há eventos aguardando aprovação.
            </p>
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventImage}>
                  <img 
                    src={event.imagem || mainImage} 
                    alt={event.nome || "Evento"}
                    onError={(e) => {
                      e.target.src = mainImage;
                    }}
                  />
                </div>
                
                <div className={styles.eventContent}>
                  <div className={styles.eventHeader}>
                    <h3 className={styles.eventTitle}>{event.nome || "Nome do evento"}</h3>
                    <span className={styles.eventStatus}>Pendente</span>
                  </div>
                  
                  <div className={styles.eventDetails}>
                    <p className={styles.eventLocation}>
                      <strong>Local:</strong> {event.localidade_nome || "Não informado"} - {event.localidade_uf || ""}
                    </p>
                    <p className={styles.eventDate}>
                      <strong>Data:</strong> {formatDateToBR(event.dataIni)}
                    </p>
                    <p className={styles.eventOrganizer}>
                      <strong>Organizador:</strong> {event.organizador_email || "Não informado"}
                    </p>
                    <p className={styles.eventPrice}>
                      <strong>Valor:</strong> {event.valorInsc ? `R$ ${parseFloat(event.valorInsc).toFixed(2)}` : "Gratuito"}
                    </p>
                  </div>
                  
                  <div className={styles.eventActions}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => handleEventClick(event.id)}
                      disabled={updatingEvents.has(event.id)}
                    >
                      Ver Detalhes
                    </button>
                    <div className={styles.actionButtons}>
                      <button 
                        className={`${styles.approveButton} ${updatingEvents.has(event.id) ? styles.disabledButton : ''}`}
                        onClick={() => handleStatusUpdate(event.id, 'ativo')}
                        disabled={updatingEvents.has(event.id)}
                      >
                        {updatingEvents.has(event.id) ? 'Processando...' : 'Aprovar'}
                      </button>
                      <button 
                        className={`${styles.rejectButton} ${updatingEvents.has(event.id) ? styles.disabledButton : ''}`}
                        onClick={() => handleStatusUpdate(event.id, 'negado')}
                        disabled={updatingEvents.has(event.id)}
                      >
                        {updatingEvents.has(event.id) ? 'Processando...' : 'Negar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStatusUpdate}
        title={confirmModal.type === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Negação'}
        message={
          confirmModal.type === 'approve' 
            ? 'Tem certeza que deseja aprovar este evento? Um email de confirmação será enviado ao organizador.'
            : 'Tem certeza que deseja negar este evento? Um email com seu feedback será enviado ao organizador.'
        }
        eventData={confirmModal.eventData}
        confirmText={confirmModal.type === 'approve' ? 'Aprovar Evento' : 'Negar Evento'}
        cancelText="Cancelar"
        type={confirmModal.type}
        requiresFeedback={confirmModal.requiresFeedback}
      />
    </div>
  );
}

export default PendingEvents;
