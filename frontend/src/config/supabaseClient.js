import { createClient } from '@supabase/supabase-js';

// Vite environment variables se values read ho rahi hain
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Frontend Warning: Supabase VITE keys are missing in .env!');
}

// Frontend Supabase Client instance initialize ho raha hai
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseClient;
