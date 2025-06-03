import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'url en el documento';
const supabaseKey = 'llave en el documento';

export const supabase = createClient(supabaseUrl, supabaseKey);