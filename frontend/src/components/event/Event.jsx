import styles from './Event.module.css';
import imagem from '../../assets/NO-PHOTO.png';
import { useNavigate } from 'react-router-dom';

function Event({ 
  id,
  title, 
  location, 
  date, 
  status = "open", 
  statusText,
  image,
  onClick 
}) {
  const navigate = useNavigate();
  const statusClass = status === "open" ? styles.statusOpen : styles.statusClosed;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      navigate(`/evento/${id}`);
    }
  };

  return (
    <div className={styles.eventCard} onClick={handleClick}>
      <img src={image || imagem} alt="Evento" className={styles.eventImage} />
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