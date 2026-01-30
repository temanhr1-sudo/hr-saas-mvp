import { createClient } from '@supabase/supabase-js'

// GANTI DENGAN PUNYAMU DARI DASHBOARD SUPABASE
const supabaseUrl = 'https://nvuyvamnsfxoqyahwkuq.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52dXl2YW1uc2Z4b3F5YWh3a3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDEzMjEsImV4cCI6MjA4NTMxNzMyMX0.g-AvCe0l_aVqqvnuVn4mKYRKk509lVLd6d2HLA_8fns'

export const supabase = createClient(supabaseUrl, supabaseKey)