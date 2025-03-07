import { serverSupabase } from './server-supabase';

export interface Event {
  id: string;
  user_id: string;
  type: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface CreateEventParams {
  user_id: string;
  type: string;
  data?: any;
}

export async function createEvent({ user_id, type, data }: CreateEventParams): Promise<Event> {
  const { data: event, error } = await serverSupabase
    .from('events')
    .insert([
      {
        user_id,
        type,
        data: data || {},
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw new Error('イベントの作成に失敗しました');
  }

  return event;
}

export async function getEvents(user_id: string): Promise<Event[]> {
  const { data: events, error } = await serverSupabase
    .from('events')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    throw new Error('イベントの取得に失敗しました');
  }

  return events || [];
}

export async function getEventsByType(user_id: string, type: string): Promise<Event[]> {
  const { data: events, error } = await serverSupabase
    .from('events')
    .select('*')
    .eq('user_id', user_id)
    .eq('type', type)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events by type:', error);
    throw new Error('イベントの取得に失敗しました');
  }

  return events || [];
}