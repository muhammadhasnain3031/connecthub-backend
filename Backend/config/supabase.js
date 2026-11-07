import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL or Anon Key is missing in .env file!');
}

// Supabase client instance initialize ho raha hai
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('⚡ Supabase Client Initialized successfully');

export default supabase;
