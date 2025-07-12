import Event from "./Event";
import mainImage from "../../assets/main-image.jpg";
import styles from "./EventList.module.css";

function EventList({ events, title, type = "open" }) {
  const currentDate = new Date();
  
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.dataIni);
    if (type === "open") {
      return eventDate >= currentDate;
    } else {
      return eventDate < currentDate;
    }
  });

  const getStatusText = (type) => {
    return type === "open" ? "Inscrições abertas" : "Evento encerrado";
  };

  return (
    <section className={styles.eventsSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.eventsGrid}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Event
              key={event.id}
              title={event.nome || "Nome do evento"}
              location={event.localidade ? `${event.localidade.cidade} - ${event.localidade.uf}` : "Local não informado"}
              date={new Date(event.dataIni).toLocaleDateString('pt-BR') + " - " + event.horarioIni}
              status={type}
              statusText={getStatusText(type)}
              image={event.photo_url || mainImage}
              onClick={() => console.log(`Evento ${event.id} clicado`)}
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
