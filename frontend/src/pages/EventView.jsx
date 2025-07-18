import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import Navigation from '../components/navigation/Navigation';
import mainImage from '../assets/NO-PHOTO.png';
import { useEvent } from '../utils/hooks/useEvent';
import { cancelEventInscription } from '../utils/api/apiTaskManager';
import styles from './EventView.module.css';

function EventView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { event, loading, error, refetch } = useEvent(id);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className={styles.eventViewContainer}>
        <Navigation />
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>Carregando evento...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.eventViewContainer}>
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

  if (!event) {
    return (
      <div className={styles.eventViewContainer}>
        <Navigation />
        <main className={styles.mainContent}>
          <div className={styles.errorContainer}>
            <div className={styles.error}>Evento não encontrado</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString, timeString) => {
    if (!dateString) return "Data não definida";
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('pt-BR');
      const formattedTime = timeString || "00:00";
      return `${formattedDate} - ${formattedTime}`;
    } catch {
      return dateString;
    }
  };

  const formatRegistrationPeriod = (start, end) => {
    if (!start || !end) return "Consulte o organizador";
    try {
      const startDate = new Date(start).toLocaleDateString('pt-BR');
      const endDate = new Date(end).toLocaleDateString('pt-BR');
      return `${startDate} até ${endDate}`;
    } catch {
      return "Consulte o organizador";
    }
  };

  const getStatusClass = (statusText) => {
    const status = statusText?.toLowerCase() || '';
    
    if (status.includes('abertas') || status.includes('aberto')) {
      return styles.statusOpen;
    } else if (status.includes('encerradas') || status.includes('encerrado')) {
      return styles.statusClosed;
    } else if (status.includes('fechadas') || status.includes('fechado')) {
      return styles.statusPending;
    }
    
    return styles.statusDefault;
  };

  const handleButtonClick = () => {
    if (event.isInscrito) {
      setShowCancelModal(true);
    } else {
      navigate(`/evento/${id}/inscricao`);
    }
  };

  const handleCancelInscription = async () => {
    try {
      setCancelLoading(true);
      
      await cancelEventInscription(id);
      
      setShowCancelModal(false);
      await refetch();
      
      alert('Inscrição cancelada com sucesso!');
      
    } catch (error) {
      console.error('Erro detalhado ao cancelar inscrição:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        isStatus500: error.isStatus500,
        fullError: error
      });
      
      if (error.response?.status === 204) {
        setShowCancelModal(false);
        await refetch();
        alert('Inscrição cancelada com sucesso!');
        return;
      }
      
      if (error.response?.status === 500 || error.isStatus500) {
        setShowCancelModal(false);
        
        try {
          await refetch();
          alert('Inscrição cancelada com sucesso!');
          return;
        } catch (refetchError) {
          console.error('Erro no refetch após status 500:', refetchError);
        }
      }
      
      alert(`Erro ao cancelar inscrição: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
  };

  return (
    <div className={styles.eventViewContainer}>
      <Navigation />
      
      <main className={styles.mainContent}>
        <div className={styles.eventHero}>
          <img 
            src={event.imagem || mainImage} 
            alt={event.nome || event.title} 
            className={styles.eventImage} 
          />
          <div className={styles.eventHeader}>
            <div className={styles.eventTitleSection}>
              <h1 className={styles.eventTitle}>{event.nome || "Nome do evento"}</h1>
              <p className={styles.eventPrice}>
                {event.valorInsc ? `R$${parseFloat(event.valorInsc).toFixed(2)}` : "Gratuito"}
              </p>
            </div>
            <div className={styles.eventDetails}>
              <span className={`${styles.eventStatus} ${getStatusClass(event.inscricaoEvento)}`}>
                {event.inscricaoEvento}
              </span>
              <p className={styles.eventLocation}>
                {event.localidade?.cidade ? `${event.localidade.cidade} - ${event.localidade.uf}` : "Local não definido"}
              </p>
              <p className={styles.eventDateTime}>
                {formatDate(event.dataIni, event.horarioIni)}
              </p>
            </div>
          </div>
        </div>

        <section className={styles.eventDescription}>
          <h2 className={styles.sectionTitle}>Descrição do evento</h2>
          <div className={styles.descriptionContent}>
            {(event.descricao || "Descrição não disponível")
              .split('\n\n')
              .map((paragraph, index) => (
                <p key={index} className={styles.descriptionParagraph}>
                  {paragraph}
                </p>
              ))}
          </div>
          
          <div className={styles.eventInfo}>
            <p className={styles.contactInfo}>
              <strong>Contato:</strong> {event.organizador_email || "Não informado"}
            </p>
            <p className={styles.registrationInfo}>
              <strong>Prazo de inscrições:</strong> {formatRegistrationPeriod(event.dataIniInsc, event.dataFimInsc)}
            </p>
          </div>

          <button 
            className={`${styles.registerButton} ${event.isInscrito ? styles.cancelButton : ''} ${!event.isInscricaoAberta ? styles.disabledButton : ''}`}
            onClick={handleButtonClick}
            disabled={!event.isInscricaoAberta}
            style={!event.isInscricaoAberta ? {
              backgroundColor: '#ccc',
              color: '#666',
              cursor: 'not-allowed',
              opacity: 0.6
            } : {}}
          >
            {event.isInscrito ? 'Cancelar Inscrição' : 'Inscreva-se'}
          </button>

          {event.isOrganizador && (
            <div className={styles.organizerActions}>
              <button 
                className={styles.editEventButton}
                onClick={() => alert('Funcionalidade de Editar Evento em desenvolvimento')}
              >
                Editar Evento
              </button>
              <button 
                className={styles.cancelEventButton}
                onClick={() => alert('Funcionalidade de Cancelar Evento em desenvolvimento')}
              >
                Cancelar Evento
              </button>
            </div>
          )}
        </section>
      </main>

      {showCancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              Tem certeza que deseja cancelar a inscrição?
            </h3>
            <p className={styles.modalSubtitle}>
              Cancelamentos fora do prazo não serão estornados.
            </p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.modalButtonSecondary}
                onClick={handleCloseModal}
              >
                Voltar
              </button>
              <button 
                className={styles.modalButtonPrimary}
                onClick={handleCancelInscription}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default EventView;
