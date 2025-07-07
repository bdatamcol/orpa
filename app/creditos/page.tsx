"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

function Creditos() {
  const router = useRouter();
  const [creditos, setCreditos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCreditId, setExpandedCreditId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: number]: string[]}>({});

  useEffect(() => {
    const fetchCreditos = async () => {
      try {
        // Obtener la sesión del usuario
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/");
          return;
        }

        const cedula = user.user_metadata?.cedula;
        if (!cedula) {
          setError("No se encontró la cédula del usuario");
          setLoading(false);
          return;
        }

        // Hacer la solicitud al endpoint local
        const response = await fetch(`/api/creditos?cedula=${cedula}`);
        if (!response.ok) {
          throw new Error("Error al obtener los créditos");
        }
        const data = await response.json();
        setCreditos(Array.isArray(data) ? data : [data]); // Asegurarse de que sea un array
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditos();
  }, [router]);

  const toggleCreditExpansion = (creditId: number) => {
    setExpandedCreditId(expandedCreditId === creditId ? null : creditId);
  };

  const toggleSection = (creditId: number, section: string) => {
    setExpandedSections(prev => {
      const creditSections = prev[creditId] || [];
      return {
        ...prev,
        [creditId]: creditSections.includes(section) 
          ? creditSections.filter(s => s !== section)
          : [...creditSections, section]
      };
    });
  };

  const isSectionExpanded = (creditId: number, section: string) => {
    return expandedSections[creditId]?.includes(section) || false;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f6f6]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#f8c327] border-r-[#f8c327] border-b-gray-200 border-l-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando créditos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f6f6]">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-[#f8c327] text-black font-medium rounded-full hover:bg-[#fad64f]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* Header para móviles */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 flex items-center px-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#000000] text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center lg:justify-start">
            <h2 className="text-xl font-bold">Menú</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-700 rounded-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <a href="/perfil" className="flex items-center font-semibold px-4 py-2 rounded-2xl hover:bg-slate-700 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Perfil
              </a>
              <a href="/creditos" className="flex items-center font-semibold px-4 py-2 rounded-2xl bg-slate-700 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Mis créditos
              </a>
              <a href="/reportes" className="flex items-center font-semibold px-4 py-2 rounded-2xl hover:bg-slate-700 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Reportar Falla
              </a>
            </div>
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl bg-[#f8c327] text-black font-bold py-2 px-4 hover:bg-[#fad64f] flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="pt-16 lg:pt-0 lg:ml-64">
        <div className="p-4 md:p-6">
          <div className="max-w-[90%] mx-auto">
            <div className="mb-6 flex items-center text-sm text-gray-500">
              <a href="/" className="hover:text-gray-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </a>
              <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <a href="/creditos" className="hover:text-gray-700">
                Mis créditos
              </a>
            </div>

            {/* Sección de créditos */}
            <div className="space-y-6">
              {creditos.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">No tienes créditos activos</h2>
                  <p className="text-gray-500">Cuando tengas créditos activos, aparecerán aquí.</p>
                </div>
              ) : (
                creditos.map((credito, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Cabecera del crédito */}
                    <div 
                      className="bg-gradient-to-r from-[#000000] to-[#333333] p-4 text-white cursor-pointer flex justify-between items-center"
                      onClick={() => toggleCreditExpansion(index)}
                    >
                      <div>
                        <h3 className="text-lg font-bold">Crédito #{credito.referencia}</h3>
                        <p className="text-sm opacity-80">
                          Cuota: {credito.siguienteCuota} de {credito.totalCuotas}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 font-semibold">${credito.valorCuota?.toLocaleString()}</span>
                        {expandedCreditId === index ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Contenido del crédito */}
                    {expandedCreditId === index && (
                      <div className="divide-y divide-gray-100">
                        {/* Información general */}
                        <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">ATH de pagos</p>
                          <p className="font-medium">{credito.ath || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Referencia</p>
                          <p className="font-medium">{credito.referencia}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Valor cuota</p>
                          <p className="font-medium">${credito.valorCuota?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cuotas</p>
                          <p className="font-medium">{credito.siguienteCuota} de {credito.totalCuotas}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Días de mora</p>
                          <p className={`font-medium ${(credito.diasMora || credito.diasMorTe || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {credito.diasMora || credito.diasMorTe || 0} días
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Último pago</p>
                          <p className="font-medium">
                            {credito.fechaUltimoPago ? new Date(credito.fechaUltimoPago).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                        </div>

                        {/* Secciones colapsables */}
                        <div className="p-4">
                          {/* Detalles de la cuota */}
                          <div className="mb-3">
                            <div 
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${isSectionExpanded(index, 'detalles') ? 'bg-gray-100' : 'bg-white border border-gray-200'}`}
                              onClick={() => toggleSection(index, 'detalles')}
                            >
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-[#f8c327] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">Detalles de la cuota</span>
                              </div>
                              {isSectionExpanded(index, 'detalles') ? (
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                            
                            {isSectionExpanded(index, 'detalles') && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-sm text-gray-500">Capital</p>
                                    <p className="font-medium">${(credito.capital || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Intereses</p>
                                    <p className="font-medium">${(credito.intereses || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Gastos de cobranza</p>
                                    <p className="font-medium">${(credito.gastosCobranza || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Total a pagar</p>
                                    <p className="font-medium text-[#f8c327]">${credito.valorCuota?.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Estado del crédito */}
                          <div className="mb-3">
                            <div 
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${isSectionExpanded(index, 'estado') ? 'bg-gray-100' : 'bg-white border border-gray-200'}`}
                              onClick={() => toggleSection(index, 'estado')}
                            >
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-[#f8c327] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Estado del crédito</span>
                              </div>
                              {isSectionExpanded(index, 'estado') ? (
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                            
                            {isSectionExpanded(index, 'estado') && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Próxima cuota</span>
                                    <span className="font-medium">Cuota {credito.siguienteCuota}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Días de mora</span>
                                    <span className={`font-medium ${(credito.diasMora || credito.diasMorTe || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {credito.diasMora || credito.diasMorTe || 0} días
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Estado</span>
                                    <span className={`font-medium ${(credito.diasMora || credito.diasMorTe || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {(credito.diasMora || credito.diasMorTe || 0) > 0 ? 'En mora' : 'Al día'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Opciones de pago */}
                          <div>
                            <div 
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${isSectionExpanded(index, 'pago') ? 'bg-gray-100' : 'bg-white border border-gray-200'}`}
                              onClick={() => toggleSection(index, 'pago')}
                            >
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-[#f8c327] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Opciones de pago</span>
                              </div>
                              {isSectionExpanded(index, 'pago') ? (
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                            
                            {isSectionExpanded(index, 'pago') && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <div className="space-y-3">
                                  <a 
                                    href="https://www.avalpaycenter.com/wps/portal/portal-de-pagos/web/pagos-aval/resultado-busqueda/realizar-pago-facturadores?idConv=00006743&origen=buscar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#f8c327] text-black font-semibold py-2.5 px-4 rounded-2xl hover:bg-[#fad64f] transition-colors flex items-center justify-center"
                                  >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pagar cuota
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Creditos;
