import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { config } from './config';

export async function getSupabaseWithAuth(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    throw new Error('No access token found');
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

let cachedSupabaseServer: SupabaseClient | null = null;

export async function getSupabaseServer(): Promise<SupabaseClient> {
  if (!cachedSupabaseServer) {
    cachedSupabaseServer = createClient(config.supabaseUrl, config.supabaseServiceKey);
  }
  return cachedSupabaseServer;
}

export async function getCurrentUser() {
  try {
    const supabase = await getSupabaseWithAuth();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}