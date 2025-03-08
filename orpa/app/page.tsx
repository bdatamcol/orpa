import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Fondo con overlay */}
      <div className="absolute inset-0 z-0">
        <Image src="/img/fondo-inicio-negro.webp" alt="Fondo" fill className="object-cover hidden md:block" priority />
        <Image
          src="/img/fondo-movil-inicio-negro.webp"
          alt="Fondo móvil"
          fill
          className="object-cover md:hidden"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Contenido principal */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-md px-4 py-8">
        {/* Logo o título */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">ORPA</h1>
          <p className="text-gray-300 text-lg">Gestión de créditos simplificada</p>
        </div>

        {/* Tarjeta de acceso */}
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cabecera de la tarjeta */}
          <div className="bg-gradient-to-r from-[#000000] to-[#333333] p-5 text-white">
            <h2 className="text-xl font-bold text-center">Acceso a tu cuenta</h2>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <Link href="/auth/login" className="block w-full">
                <button className="w-full bg-[#f8c327] text-black py-3 px-4 rounded-lg hover:bg-[#fad64f] transition-colors font-semibold flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Iniciar Sesión
                </button>
              </Link>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              <Link href="/auth/register" className="block w-full">
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Crear una cuenta
                </button>
              </Link>
            </div>

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
                ¿Por qué elegir ORPA?
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-[#f8c327] mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Gestión sencilla de tus créditos
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-[#f8c327] mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Información actualizada en tiempo real
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-[#f8c327] mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Acceso seguro a tus datos
                </li>
              </ul>
            </div>
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

