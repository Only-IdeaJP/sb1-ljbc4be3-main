/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { createEvent, getEvents, getEventsByType, Event } from '../lib/events';
import { useAuth } from './useAuth';

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic function to fetch events
  const fetchData = async (fetchFunction: () => Promise<Event[]>) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFunction();
      setEvents(data);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = useCallback(() => fetchData(() => getEvents(user!.id)), [user]);
  const fetchEventsByType = useCallback((type: string) => fetchData(() => getEventsByType(user!.id, type)), [user]);

  const addEvent = useCallback(async (type: string, data?: any) => {
    if (!user) {
      setError('User is not logged in');
      return;
    }
    try {
      const newEvent = await createEvent({ user_id: user.id, type, data });
      setEvents(prev => [newEvent, ...prev]);
    } catch (err: any) {
      console.error('Error adding event:', err);
      setError(err.message);
    }
  }, [user]);

  return { events, loading, error, fetchEvents, fetchEventsByType, addEvent };
}
