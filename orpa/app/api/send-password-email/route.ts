import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { cedula } = await request.json();

    if (!cedula) {
      return NextResponse.json(
        { success: false, error: "Cédula es requerida" },
        { status: 400 }
      );
    }

    // Buscar el correo asociado a la cédula en la tabla usuarios
    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("correo")
      .eq("cedula", cedula)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "No se encontró ninguna cuenta con esta cédula.",
        },
        { status: 404 }
      );
    }

    const correo = user.correo;

    // Enviar correo de restablecimiento de contraseña usando Supabase
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      correo,
      {
        redirectTo: `${request.headers.get("origin")}/auth/reset-password`,
      }
    );

    if (resetError) {
      console.error("Error al enviar correo de recuperación:", resetError);
      return NextResponse.json(
        {
          success: false,
          error: "Error al enviar el correo de recuperación.",
          details: resetError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
    });
  } catch (error: any) {
    console.error("Error en el proceso de recuperación:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error en el proceso de recuperación.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}