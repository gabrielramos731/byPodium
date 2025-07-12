import { useState, useEffect } from 'react';
import getAllEvents from '../api/apiTaskManager';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventsData = await getAllEvents();
        setEvents(eventsData);
      } catch (error) {
        setError("Erro ao carregar eventos");
        console.error("Erro ao buscar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await getAllEvents();
      setEvents(eventsData);
    } catch (error) {
      setError("Erro ao carregar eventos");
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, refetch };
}
