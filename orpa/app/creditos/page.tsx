"use client"
import React, { useState } from "react"

function Creditos() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 flex items-center px-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="ml-4 text-xl font-semibold">Créditos</h1>
      </header>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-indigo-800 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ... Sidebar (sin cambios) ... */}
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center lg:justify-start">
            <h2 className="text-xl font-bold">Menú</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-indigo-700 rounded-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <a href="/perfil" className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors">
                Inicio
              </a>
              <a href="/creditos" className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors">
                Mis créditos
              </a>
            </div>
          </nav>

          <div className="p-4">
            <button
              // onClick={handleLogout} //  RECUERDA: Si necesitas la función de logout aquí, deberás importarla y configurarla correctamente.
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className={`pt-16 lg:pt-0 lg:ml-64`}>
        <div className="p-4">
          <div className="max-w-[90%] mx-auto">
            <div className="mb-6 flex items-center text-sm text-gray-500">
              <a href="/" className="hover:text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </a>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <a href="/creditos" className="hover:text-gray-700">
                Créditos
              </a>
            </div>

            {/* Contenedor para las tarjetas de créditos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Modificado a grid-cols-1 md:grid-cols-2 */}
              {/* Tarjeta de Crédito 1 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-2 gap-4"> {/* Grid de 2 columnas dentro de la tarjeta */}
                  <div> {/* Columna izquierda */}
                    <h2 className="text-xl font-semibold text-indigo-700 mb-4">Referencia: OD00030857</h2>
                    <div className="mb-2">
                      <p className="text-gray-700 font-semibold">Valor:</p>
                      <p className="text-gray-700">$170,567.00</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-gray-700 font-semibold">Fecha de Pago:</p>
                      <p className="text-gray-700">10/01/2025</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-gray-700 font-semibold">Capital:</p>
                      <p className="text-gray-700">$166,667.00</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-gray-700 font-semibold">Intereses de mora:</p>
                      <p className="text-gray-700">$4,225.00</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-gray-700 font-semibold">Gastos de cobranza:</p>
                      <p className="text-gray-700">$0.00</p>
                    </div>
                  </div>
                  <div> {/* Columna derecha */}
                    <div className="mt-6 lg:mt-0 border-t lg:border-t-0 lg:pl-4 pt-4 lg:pt-0"> {/* Ajuste de clases para la línea divisoria */}
                      <h3 className="text-lg font-semibold text-indigo-700 mb-2">Próxima cuota</h3>
                      <div className="mb-2">
                        <p className="text-gray-700 font-semibold">Valor de la cuota:</p>
                        <p className="text-gray-700">$170,567.00</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-gray-700 font-semibold">Fecha de pago:</p>
                        <p className="text-gray-700">10/01/2025</p>
                      </div>
                      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 lg:mt-6"> {/* Ajuste de margen superior */}
                        Pagar cuota <span className="ml-2 pse-icon">PSE</span> {/* Placeholder para el icono de PSE */}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Crédito 2 (Ejemplo - Puedes copiar y modificar para más tarjetas) */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-2 gap-4"> {/* Grid de 2 columnas dentro de la tarjeta */}
                  <div> {/* Columna izquierda */}
                    <h2 className="text-xl font-semibold text-indigo-700 mb-4">Referencia: OD00030999</h2>
                    <div className="mb-2">
                      <p className="text-gray-700 font-semibold">Valor:</p>
                      <p className="text-gray-700">$95,200.00</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-gray-700 font-semibold">Fecha de Pago:</p>
                      <p className="text-gray-700">25/12/2024</p>
                    </div>
                    {/* ... (puedes añadir más datos o dejarlos más simples para otras tarjetas) */}
                  </div>
                  <div> {/* Columna derecha */}
                    <div className="mt-6 lg:mt-0 border-t lg:border-t-0 lg:pl-4 pt-4 lg:pt-0"> {/* Ajuste de clases para la línea divisoria */}
                      <h3 className="text-lg font-semibold text-indigo-700 mb-2">Próxima cuota</h3>
                      <div className="mb-2">
                        <p className="text-gray-700 font-semibold">Valor de la cuota:</p>
                        <p className="text-gray-700">$95,200.00</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-gray-700 font-semibold">Fecha de pago:</p>
                        <p className="text-gray-700">25/12/2024</p>
                      </div>
                      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 lg:mt-6"> {/* Ajuste de margen superior */}
                        Pagar cuota <span className="ml-2 pse-icon">PSE</span> {/* Placeholder para el icono de PSE */}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Puedes añadir más tarjetas de crédito aquí, copiando y modificando los bloques <div className="bg-white rounded-lg shadow-md p-6"> ... </div> */}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Creditos;