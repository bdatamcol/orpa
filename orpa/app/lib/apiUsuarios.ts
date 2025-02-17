export const verificarCedula = async (cedula: string) => {
  try {
    const url = `/api/verificarCedula?cedula=${cedula}`; // Llamamos a la API interna de Next.js

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return { success: false, error: "Error al consultar la API externa" };
    }

    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error conectando con la API de validación:", error);
    return { success: false, error: "Error en la solicitud" };
  }
};
