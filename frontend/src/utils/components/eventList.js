import { useEffect, useState } from 'react';
import api from '../utils/api';

function EventsList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/api/')
      .then(response => setEvents(response.data))
      .catch(error => console.error('Erro ao buscar eventos:', error));
  }, []);

  return events;
}

export default EventsList;