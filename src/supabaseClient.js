import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnekjthnnigkcbrtxwth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZWtqdGhubmlna2NicnR4d3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjQxMjUsImV4cCI6MjA2NzE0MDEyNX0.P-2fCqn8U2H2e6-BUpdWyod__LQZLETSjSZAE048HY0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
