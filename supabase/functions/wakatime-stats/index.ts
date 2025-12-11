import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const wakatimeApiKey = Deno.env.get('WAKATIME_API_KEY');
    
    if (!wakatimeApiKey) {
      return new Response(
        JSON.stringify({ error: 'WakaTime API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from WakaTime API
    const response = await fetch(
      'https://wakatime.com/api/v1/users/current/all_time_since_today',
      {
        headers: {
          'Authorization': `Basic ${btoa(wakatimeApiKey)}`,
        },
      }
    );

    if (!response.ok) {
      console.error('WakaTime API error:', response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from WakaTime' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


