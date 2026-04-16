const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

export const config = {
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceKey: supabaseServiceKey ?? supabaseAnonKey,
  isProduction: process.env.NODE_ENV === 'production',
};