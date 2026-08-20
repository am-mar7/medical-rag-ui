import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzaaikgnmqdwqaszdkgj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2eCfs8Y-mV65wukSFXvSjw_446IGuBt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
