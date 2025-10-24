import { createClient } from '@supabase/supabase-js'

// ✅ URL exacta de tu proyecto Supabase (verificada en Settings → API → Project URL)
const supabaseUrl = 'https://vmwhngvffpmrkkuvtzoe.supabase.co'

// ✅ Clave pública anon (copiada completa de Settings → API → anon public)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd2huZ3ZmZnBtcmtrdXZ0em9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODgxNzQsImV4cCI6MjA3NjU2NDE3NH0.jx2ET8WACOkGgys_lkex8mvMI2sAJBryogFYJnXRj_U'

// ✅ Crear cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
