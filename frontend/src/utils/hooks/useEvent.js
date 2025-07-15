import { useState, useEffect, useCallback } from 'react';
import { getEventById } from '../api/apiTaskManager';

export function useEvent(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

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
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const refetch = () => {
    fetchEvent();
  };

  return { event, loading, error, refetch };
}
