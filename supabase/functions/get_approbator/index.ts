import { createClient } from "npm:@supabase/supabase-js@2";

interface WebhookPayload {
  type: "SELECT";
  table: string;
  schema: "public";
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async() => {
  const { data } = await supabase
    .from("users")
    .select("userId")
    .eq("notify_approbations", true)
    .single();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
});