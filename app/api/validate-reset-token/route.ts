import { NextRequest, NextResponse } from 'next/server'
import { directEmailService } from '../../../lib/services/directEmailService'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    // Validar parámetros requeridos
    if (!token || !email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token y email son requeridos' 
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

    // Validar token usando el servicio directo
    const tokenData = directEmailService.validateResetToken(token)
    const isValid = tokenData && tokenData.email === email

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Token válido'
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.' 
        },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Error validating reset token:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor al validar el token' 
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