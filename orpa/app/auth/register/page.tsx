"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { verificarCedula } from "../../lib/apiUsuarios"
import { supabase } from "../../lib/supabaseClient"

export default function Register() {
  const router = useRouter()
  const [cedula, setCedula] = useState("")
  const [loadingCedula, setLoadingCedula] = useState(false)
  const [datosCargados, setDatosCargados] = useState(false)
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    nombre1: "",
    nombre2: "",
    apellido1: "",
    apellido2: "",
    correo: "",
    telefono: "",
    tipo_documento: "Cédula de Ciudadanía",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/perfil")
      } else {
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  const handleCedulaCheck = async () => {
    setLoadingCedula(true)
    setShowModal(false)

    try {
      const res = await verificarCedula(cedula)
      setLoadingCedula(false)

      if (!res.success || !res.data) {
        setShowModal(true)
        return
      }

      const userData = res.data

      if (!userData.e_mail || userData.e_mail.trim() === "") {
        setShowModal(true)
        return
      }

      setDatosCargados(true)
      setUsuarioEncontrado(true)

      setForm({
        nombre1: userData.nom1_cli || "",
        nombre2: userData.nom2_cli || "",
        apellido1: userData.ap1_cli || "",
        apellido2: userData.ap2_cli || "",
        correo: userData.e_mail.trim(),
        telefono: userData.te1_cli || userData.te2_cli || "",
        tipo_documento: userData.tip_ide === "01" ? "Cédula de Ciudadanía" : "Cédula de Extranjería",
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      setLoadingCedula(false)
      setShowModal(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden.")
      return
    }

    if (!form.correo) {
      alert("Error: No se obtuvo un correo válido de la API externa.")
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
        options: {
          data: {
            nombre1: form.nombre1,
            nombre2: form.nombre2,
            apellido1: form.apellido1,
            apellido2: form.apellido2,
            telefono: form.telefono,
            tipo_documento: form.tipo_documento,
            cedula: cedula,
          },
        },
      })

      if (error) throw error

      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          cedula: cedula,
          nombre1: form.nombre1,
          nombre2: form.nombre2,
          apellido1: form.apellido1,
          apellido2: form.apellido2,
          tipo_documento: form.tipo_documento,
          correo: form.correo,
          telefono: form.telefono,
        },
      ])

      if (dbError) throw dbError

      alert("Registro exitoso. Verifica tu correo para completar el proceso.")
      router.push("/auth/login")
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return <p className="text-center text-gray-600">Cargando...</p>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Registro</h2>
        </div>

        {!datosCargados && (
          <div className="mt-8 space-y-6">
            <input
              type="text"
              placeholder="Número de Cédula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              required
            />
            <button
              onClick={handleCedulaCheck}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loadingCedula}
            >
              {loadingCedula ? "Verificando..." : "Validar Cédula"}
            </button>
          </div>
        )}

        {datosCargados && usuarioEncontrado && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  name="nombre1"
                  value={form.nombre1}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  disabled
                />
              </div>
              <div>
                <input
                  name="nombre2"
                  value={form.nombre2}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  disabled
                />
              </div>
              <div>
                <input
                  name="apellido1"
                  value={form.apellido1}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  disabled
                />
              </div>
              <div>
                <input
                  name="apellido2"
                  value={form.apellido2}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  disabled
                />
              </div>
              <div>
                <input
                  name="correo"
                  type="email"
                  value={form.correo}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  disabled
                />
              </div>
              <div>
                <input
                  name="telefono"
                  value={form.telefono}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  disabled
                />
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required
                />
              </div>
              <div>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmar Contraseña"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Registrarse
              </button>
            </div>
          </form>
        )}

        {showModal && (
          <div
            className="fixed inset-0 z-10 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        No hay historial de créditos
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Te invitamos a que adquieras tu primer crédito con ORPA</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => (window.location.href = "https://orpainversiones.com/")}
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

