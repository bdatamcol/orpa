// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { cedula } = await req.json();

    if (!cedula) {
      return new Response(
        JSON.stringify({ success: false, error: "Cédula es requerida" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar el correo asociado a la cédula en la tabla usuarios
    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("correo")
      .eq("cedula", cedula)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No se encontró ninguna cuenta con esta cédula.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    const correo = user.correo;

    // Enviar correo de restablecimiento de contraseña usando Supabase
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      correo,
      {
        redirectTo: `${req.headers.get("origin")}/auth/reset-password`,
      }
    );

    if (resetError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error al enviar el correo de recuperación.",
          details: resetError.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error en el proceso de recuperación.",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});