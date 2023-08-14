import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hrmaczanaeemkvnybbzo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWFjemFuYWVlbWt2bnliYnpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MjAxNDI0NSwiZXhwIjoyMDA3NTkwMjQ1fQ.vG9-kdEuLMqMkG2U_6lwRgkQ8MwSt2KhIYwxnVixHSk"
);

export default supabase;
