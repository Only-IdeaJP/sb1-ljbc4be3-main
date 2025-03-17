/* eslint-disable @typescript-eslint/no-explicit-any */
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

export async function createEvent({ user_id, type, data = {} }: CreateEventParams): Promise<Event> {
  const { data: event, error } = await serverSupabase
    .from('events')
    .insert([{ user_id, type, data }])
    .select()
    .single();

  if (error) throw new Error(`イベントの作成に失敗しました: ${error.message}`);

  return event;
}

export async function getEvents(user_id: string): Promise<Event[]> {
  return fetchEvents({ user_id });
}

export async function getEventsByType(user_id: string, type: string): Promise<Event[]> {
  return fetchEvents({ user_id, type });
}

async function fetchEvents(filters: { user_id: string; type?: string }): Promise<Event[]> {
  const query = serverSupabase
    .from('events')
    .select('*')
    .eq('user_id', filters.user_id)
    .order('created_at', { ascending: false });

  if (filters.type) query.eq('type', filters.type);

  const { data: events, error } = await query;

  if (error) throw new Error(`イベントの取得に失敗しました: ${error.message}`);

  return events || [];
}
