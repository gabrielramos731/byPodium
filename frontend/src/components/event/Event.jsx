import styles from './Event.module.css';
import imagem from '../../assets/main-image.jpg'
function Event({ 
  title = "Nome do evento", 
  location = "Montes Claros - MG", 
  date = "10/08/2025 - 06:30", 
  status = "open", 
  statusText = "Inscrições abertas",
  // image,
  onClick 
}) {
  const statusClass = status === "open" ? styles.statusOpen : styles.statusClosed;

  return (
    <div className={styles.eventCard} onClick={onClick}>
      <img src={imagem} alt="Evento" className={styles.eventImage} />
      <div className={styles.eventInfo}>
        <h3 className={styles.eventTitle}>{title}</h3>
        <p className={styles.eventLocation}>{location}</p>
        <p className={styles.eventDate}>{date}</p>
        <span className={`${styles.eventStatus} ${statusClass}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}

export default Event;