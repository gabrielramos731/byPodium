import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import Navigation from '../components/navigation/Navigation';
import mainImage from '../assets/NO-PHOTO.png';
import { useEvent } from '../utils/hooks/useEvent';
import styles from './EventView.module.css';

function EventView() {
  const { id } = useParams();
  const { event, loading, error } = useEvent(id);

  useEffect(() => {
    console.log("Event data loaded:", event);
    console.log("Status do evento:", event?.isInscricaoAberta);
  }, [event]);

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
              <span className={styles.eventStatus}>
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

          <button className={styles.registerButton}>
            Inscreva-se
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default EventView;
