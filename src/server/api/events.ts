import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
  const { data: event, error } = await supabase
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
    throw error;
  }

  return event;
}

export async function getEvents(user_id: string): Promise<Event[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return events;
}

export async function getEventsByType(user_id: string, type: string): Promise<Event[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user_id)
    .eq('type', type)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return events;
}