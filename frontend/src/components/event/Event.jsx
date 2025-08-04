import styles from './Event.module.css';
import imagem from '../../assets/NO-PHOTO.png';
import { useNavigate } from 'react-router-dom';

function Event({ 
  id,
  title, 
  location, 
  date, 
  statusText,
  isInscricaoAberta,
  image,
  onClick 
}) {
  const navigate = useNavigate();

  const getStatusStyle = () => {
    if (isInscricaoAberta === true) {
      return {
        backgroundColor: '#2d5016',
        color: '#90ee90'
      };
    } else if (isInscricaoAberta === false) {
      return {
        backgroundColor: '#4a3728',
        color: '#ffa500'
      };
    }
    
    return {
      backgroundColor: '#555',
      color: '#ccc'
    };
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id && id !== undefined && id !== null) {
      navigate(`/evento/${id}`);
    } else {
      console.warn('Event ID is undefined, navigation prevented');
    }
  };

  return (
    <div className={styles.eventCard} onClick={handleClick}>
      <img src={image || imagem} alt="Evento" className={styles.eventImage} />
      <div className={styles.eventInfo}>
        <h3 className={styles.eventTitle}>{title}</h3>
        <p className={styles.eventLocation}>{location}</p>
        <p className={styles.eventDate}>{date}</p>
        <span 
          className={styles.eventStatus}
          style={getStatusStyle()}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}

export default Event;