import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://awippxgsdwonspjxkmlr.supabase.co';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXBweGdzZHdvbnNwanhrbWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjg2MzUsImV4cCI6MjEwNDYwNDYzNX0.H9lSmW-soJqyo-aHkOHBQeOdGIhfgl0BqgUiQ63TE8g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
