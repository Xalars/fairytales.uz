
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ktbdyngkwivznapizgan.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YmR5bmdrd2l2em5hcGl6Z2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzExODQsImV4cCI6MjA2NTkwNzE4NH0.TAJIx3XqI1XzghnbsBOCh9Mr-BCqC6vNuRrhGQmQ3Rs"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
