import { useState, useCallback } from 'react';
import { createEvent, getEvents, getEventsByType, Event } from '../lib/events';
import { useAuth } from './useAuth';

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents(user.id);
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchEventsByType = useCallback(async (type: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEventsByType(user.id, type);
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching events by type:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addEvent = useCallback(async (type: string, data?: any) => {
    if (!user) {
      setError('ユーザーがログインしていません');
      return;
    }
    setError(null);
    try {
      const event = await createEvent({
        user_id: user.id,
        type,
        data,
      });
      setEvents(prev => [event, ...prev]);
      return event;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding event:', err);
      throw err;
    }
  }, [user]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    fetchEventsByType,
    addEvent,
  };
}