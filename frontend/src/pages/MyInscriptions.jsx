import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mainImage from '../assets/main-image.jpg';
import mainLogo from '../assets/logo-main.svg';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import { getUserInscriptions } from '../utils/api/apiTaskManager';
import styles from './MyInscriptions.module.css';

function MyInscriptions() {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeEvents, setActiveEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const loadInscriptions = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getUserInscriptions();
        setInscriptions(response);
        separateEventsByDate(response);
        
      } catch (error) {
        console.error('Erro ao buscar inscrições:', error);
        
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Erro ao carregar suas inscrições. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadInscriptions();
  }, [navigate]);

  const separateEventsByDate = (inscriptionsList) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const active = [];
    const past = [];

    inscriptionsList.forEach(inscription => {
      const eventDate = new Date(inscription.evento.dataIni);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate >= currentDate) {
        active.push(inscription);
      } else {
        past.push(inscription);
      }
    });

    active.sort((a, b) => new Date(a.evento.dataIni) - new Date(b.evento.dataIni));
    
    past.sort((a, b) => new Date(b.evento.dataIni) - new Date(a.evento.dataIni));

    setActiveEvents(active);
    setPastEvents(past);
  };

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getUserInscriptions();
      setInscriptions(response);
      separateEventsByDate(response);
      
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
      
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Erro ao carregar suas inscrições. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/evento/${eventId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return styles.statusConfirmed;
      case 'pendente':
        return styles.statusPending;
      case 'cancelada':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status || 'Não informado';
    }
  };

  const renderEventCard = (inscription) => (
    <div 
      key={inscription.id} 
      className={styles.inscriptionCard}
      onClick={() => handleEventClick(inscription.evento.id)}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.eventName}>{inscription.evento.nome}</h3>
        <span className={`${styles.status} ${getStatusColor(inscription.status)}`}>
          {getStatusText(inscription.status)}
        </span>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.eventInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Local:</span>
            <span className={styles.infoValue}>
              {(inscription.evento.localidade?.cidade && inscription.evento.localidade?.uf)
                ? `${inscription.evento.localidade.cidade} - ${inscription.evento.localidade.uf}`
                : 'Local não informado'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Data:</span>
            <span className={styles.infoValue}>
              {formatDate(inscription.evento.dataIni)}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Horário:</span>
            <span className={styles.infoValue}>
              {formatTime(inscription.evento.horarioIni)}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Kit:</span>
            <span className={styles.infoValue}>
              {inscription.kit?.nome || 'Kit não informado'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Categoria:</span>
            <span className={styles.infoValue}>
              {inscription.categoria?.nome || 'Categoria não informada'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.viewDetails}>
          Clique para ver detalhes →
        </span>
      </div>
    </div>
  );

  const renderEventsSection = (title, events, emptyMessage) => {
    return (
      <section className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.eventsGrid}>
          {events.length > 0 ? (
            events.map(renderEventCard)
          ) : (
            <p className={styles.noEvents}>{emptyMessage}</p>
          )}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <>
        <section className={styles.heroBanner}>
          <img src={mainImage} alt="ByPodium Banner" className={styles.bannerImage} />
          <div className={styles.bannerOverlay}>
            <div className={styles.bannerContent}>
              <img src={mainLogo} alt="main-logo" />
            </div>
            <Navigation />
          </div>
        </section>
        <div className={styles.loading}>Carregando suas inscrições...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className={styles.heroBanner}>
          <img src={mainImage} alt="ByPodium Banner" className={styles.bannerImage} />
          <div className={styles.bannerOverlay}>
            <div className={styles.bannerContent}>
              <img src={mainLogo} alt="main-logo" />
            </div>
            <Navigation />
          </div>
        </section>
        <div className={styles.error}>{error}</div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <button 
            onClick={fetchInscriptions}
            className={styles.retryButton}
          >
            Tentar novamente
          </button>
        </div>
        <Footer />
      </>
    );
  }

return (
    <>
      <section className={styles.heroBanner}>
        <img src={mainImage} alt="ByPodium Banner" className={styles.bannerImage} />
        <div className={styles.bannerOverlay}>
          <div className={styles.bannerContent}>
            <img src={mainLogo} alt="main-logo" />
          </div>
          <Navigation />
        </div>
      </section>

      {inscriptions.length === 0 ? (
        <section className={styles.eventsSection}>
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Você não possui nenhum evento no histórico</h2>
            <p className={styles.emptyText}>
              Quando você se inscrever em eventos, eles aparecerão aqui.
            </p>
          </div>
        </section>
      ) : (
        <>
          {renderEventsSection(
            "Eventos Ativos", 
            activeEvents, 
            "Você não possui eventos futuros no momento."
          )}
          
          {renderEventsSection(
            "Histórico de Eventos", 
            pastEvents, 
            "Você ainda não participou de nenhum evento."
          )}
        </>
      )}

      <Footer />
    </>
);
}

export default MyInscriptions;
