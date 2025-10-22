import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmwhngvffpmrkkuvtzoe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlIjoiN3JtYmpvbnYxMW9sWTF0aHNjczMzZ0lGZTlZIn0.gWBWvE3rVGLvMfxV_NH2gUG4n7aN2ZfC2T2c7vN8m5Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)