import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      cpu_usage,
      ram_usage,
      gpu_usage,
      gpu_temp,
      gpu2_usage,
      gpu2_temp,
      storage_used_gb,
      storage_total_gb,
      stats_meta,
    } = await req.json();

    if (typeof cpu_usage !== "number" || typeof ram_usage !== "number") {
      return new Response(
        JSON.stringify({ error: "cpu_usage and ram_usage are required as numbers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await supabase
      .from("laptop_stats")
      .insert([
        {
          cpu_usage,
          ram_usage,
          gpu_usage: gpu_usage ?? null,
          gpu_temp: gpu_temp ?? null,
          gpu2_usage: gpu2_usage ?? null,
          gpu2_temp: gpu2_temp ?? null,
          storage_used_gb: storage_used_gb ?? null,
          storage_total_gb: storage_total_gb ?? null,
          stats_meta: stats_meta ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error (laptop_stats):", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
