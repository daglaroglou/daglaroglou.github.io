import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase environment variables are missing!');
  console.error('Please create a .env file with:');
  console.error('VITE_SUPABASE_URL=your-url');
  console.error('VITE_SUPABASE_ANON_KEY=your-key');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});