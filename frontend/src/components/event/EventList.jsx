import Event from "./Event";
import { formatDateToBR } from '../../utils/dateUtils';
import styles from "./EventList.module.css";

function EventList({ events, title, type = "open" }) {
  const filteredEvents = events.filter(event => {
    if (type === "open") {
      return event.isInscricaoAberta === true;
    } else {
      return event.isInscricaoAberta === false;
    }
  });

  const getStatusText = (isInscricaoAberta) => {
    return isInscricaoAberta === true ? "Evento disponível" : "Evento Indisponível";
  };

  return (
    <section className={styles.eventsSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.eventsGrid}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Event
              key={event.id}
              id={event.id}
              title={event.nome || "Nome do evento"}
              location={event.localidade ? `${event.localidade.cidade} - ${event.localidade.uf}` : "Local não informado"}
              date={formatDateToBR(event.dataIni) + " - " + event.horarioIni}
              statusText={getStatusText(event.isInscricaoAberta)}
              isInscricaoAberta={event.isInscricaoAberta}
              image={event.photo_url}
            />
          ))
        ) : (
          <p className={styles.noEvents}>
            {type === "open" 
              ? "Nenhum evento com inscrições abertas encontrado." 
              : "Nenhum evento encerrado encontrado."
            }
          </p>
        )}
      </div>
    </section>
  );
}

export default EventList;
