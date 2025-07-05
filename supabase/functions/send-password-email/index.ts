// Supabase Edge Function for password reset
// This function handles password reset requests via email

import { createClient } from '@supabase/supabase-js';

// Define a type for the serve function to maintain compatibility
type ServeFunction = (handler: (req: Request) => Promise<Response>) => void;

// Create a simple serve implementation compatible with TypeScript
const serve: ServeFunction = (handler) => {
  // This is a placeholder that will be replaced by Supabase Edge runtime
  // The actual implementation is provided by Supabase when deployed
};

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
    const supabaseUrl = process.env.SUPABASE_URL ?? "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
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
    // Manejar el error como tipo unknown y extraer el mensaje de forma segura
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error en el proceso de recuperación.",
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});