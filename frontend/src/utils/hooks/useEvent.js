import { useState, useEffect } from 'react';
import { getEventById } from '../api/apiTaskManager';

export function useEvent(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await getEventById(id);
        setEvent(eventData);
      } catch (error) {
        setError("Erro ao carregar evento");
        console.error("Erro ao buscar evento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  return { event, loading, error };
}
