"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { verificarCedula } from "../../lib/apiUsuarios"
import { supabase } from "../../lib/supabaseClient"

export default function Register() {
  const router = useRouter()
  const [cedula, setCedula] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [datosCargados, setDatosCargados] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    celular: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) router.push("/perfil")
      } finally {
        setInitialLoading(false)
      }
    }
    checkSession()
  }, [router])

  const handleCedulaCheck = async () => {
    if (!cedula.trim()) {
      setError("Por favor ingresa un número de cédula válido.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Primero verifica si ya está registrada en Supabase
      const { data: existingUser, error } = await supabase.from("usuarios").select("*").eq("cedula", cedula)

      if (error) {
        throw new Error("Error al verificar cédula en base de datos.")
      }

      if (existingUser && existingUser.length > 0) {
        setPopupMessage("Ya existe una cuenta registrada con este número de cédula. Por favor inicia sesión.")
        setShowPopup(true)
        return
      }

      const res = await verificarCedula(cedula)

      if (res.success && res.data) {
        setForm({
          nombres: res.data.nombres || "",
          apellidos: res.data.apellidos || "",
          correo: res.data.email || "",
          celular: res.data.celular || "",
          password: "",
          confirmPassword: "",
        })
        setDatosCargados(true)
      } else {
        setPopupMessage("¡Cédula no encontrada! Solicita tu primer crédito con Orpa.")
        setShowPopup(true)
      }
    } catch (err) {
      setError(err.message || "Error al verificar la cédula. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
        options: { data: { nombres: form.nombres, apellidos: form.apellidos, cedula } },
      })

      if (authError) throw new Error(authError.message)

      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          cedula,
          nombre1: form.nombres,
          apellido1: form.apellidos,
          correo: form.correo,
          telefono: form.celular ? Number.parseInt(form.celular) : null,
        },
      ])

      if (dbError) throw new Error(dbError.message)

      // Mostrar mensaje de éxito
      setPopupMessage("¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.")
      setShowPopup(true)
    } catch (err) {
      setError(err.message || "Error en el registro. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const closePopup = () => {
    setShowPopup(false)
    if (popupMessage.includes("exitoso")) {
      router.push("/auth/login")
    } else if (popupMessage.includes("Ya existe")) {
      router.push("/auth/login")
    } else {
      router.push("/")
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f6f6]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#f8c327] border-r-[#f8c327] border-b-gray-200 border-l-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Fondo con overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/fondo-registro-blanco.webp"
          alt="Fondo"
          fill
          className="object-cover hidden md:block"
          priority
        />
        <Image
          src="/img/fondo-movil-registro-blanco.webp"
          alt="Fondo móvil"
          fill
          className="object-cover md:hidden"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Popup modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <div className="text-center mb-4">
              {popupMessage.includes("exitoso") ? (
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg className="w-16 h-16 text-[#f8c327] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <h3 className="text-xl font-bold mt-2">
                {popupMessage.includes("exitoso") ? "¡Registro Exitoso!" : "Información"}
              </h3>
            </div>
            <p className="text-gray-700 mb-6 text-center">{popupMessage}</p>
            <button
              className="w-full bg-[#f8c327] text-black py-3 px-4 rounded-lg hover:bg-[#fad64f] transition-colors font-semibold"
              onClick={closePopup}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-md px-4 py-8">
        {/* Logo o título */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2">ORPA</h1>
          </Link>
          <p className="text-gray-300 text-lg">Crea tu cuenta</p>
        </div>

        {/* Tarjeta de registro */}
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cabecera de la tarjeta */}
          <div className="bg-gradient-to-r from-[#000000] to-[#333333] p-5 text-white">
            <h2 className="text-xl font-bold text-center">Registro de Usuario</h2>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!datosCargados ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#f8c327]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Paso 1: Validación de Cédula
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ingresa tu número de cédula para validar tus datos en el sistema.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Cédula
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                            />
                          </svg>
                        </div>
                        <input
                          id="cedula"
                          type="text"
                          value={cedula}
                          onChange={(e) => setCedula(e.target.value)}
                          placeholder="Ingresa tu número de cédula"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-[#f8c327]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCedulaCheck}
                      disabled={loading}
                      className="w-full bg-[#f8c327] text-black py-3 px-4 rounded-lg hover:bg-[#fad64f] transition-colors font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verificando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Validar Cédula
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/auth/login" className="font-medium text-[#b2570b] hover:text-[#f8c327]">
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#f8c327]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Paso 2: Información Personal
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Estos datos han sido cargados automáticamente. No pueden ser modificados.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombres
                      </label>
                      <input
                        id="nombres"
                        name="nombres"
                        value={form.nombres}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellidos
                      </label>
                      <input
                        id="apellidos"
                        name="apellidos"
                        value={form.apellidos}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        id="correo"
                        name="correo"
                        value={form.correo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
                        Celular
                      </label>
                      <input
                        id="celular"
                        name="celular"
                        value={form.celular}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#f8c327]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Paso 3: Crear Contraseña
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Crea una contraseña segura para tu cuenta. Debe tener al menos 6 caracteres.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="Ingresa tu contraseña"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-[#f8c327]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirma tu contraseña"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-[#f8c327]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f8c327] text-black py-3 px-4 rounded-lg hover:bg-[#fad64f] transition-colors font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      Completar Registro
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} ORPA. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}

