export const verificarCedula = async (cedula: string) => {
  try {
    const response = await fetch(`/api/verificarCedula?cedula=${cedula}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Error desconocido" };
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
