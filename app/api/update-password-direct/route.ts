import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'
import { directEmailService } from '../../../lib/services/directEmailService'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json()

    // Validar parámetros requeridos
    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token, email y nueva contraseña son requeridos' 
        },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Formato de email inválido' 
        },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'La contraseña debe tener al menos 6 caracteres' 
        },
        { status: 400 }
      )
    }

    // Validar token usando el servicio directo
    const isValidToken = await directEmailService.validateResetToken(token, email)
    
    if (!isValidToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.' 
        },
        { status: 401 }
      )
    }

    // Buscar usuario por email en Supabase
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, correo')
      .eq('correo', email)
      .single()

    if (userError || !userData) {
      console.error('Error finding user:', userError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuario no encontrado' 
        },
        { status: 404 }
      )
    }

    // Hashear la nueva contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Actualizar contraseña en Supabase
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error al actualizar la contraseña en la base de datos' 
        },
        { status: 500 }
      )
    }

    // Consumir el token para que no pueda ser reutilizado
    await directEmailService.consumeResetToken(token, email)

    // Log de seguridad (sin incluir información sensible)
    console.log(`Password updated successfully for user: ${email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error updating password:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor al actualizar la contraseña' 
      },
      { status: 500 }
    )
  }
}

// Método OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}