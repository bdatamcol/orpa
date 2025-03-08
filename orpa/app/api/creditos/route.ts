import { NextResponse } from "next/server";

async function getAuthToken() {
  const loginUrl = "https://api.hph.com.co/api/Authenticate/login";
  const credentials = {
    username: "Admin",
    password: "Aq12wsxc*.",
  };

  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`Error en la autenticación: ${response.status}`);
  }

  const data = await response.json();
  return data.token; // Ajusta según la estructura real de la respuesta
}

async function fetchCreditosFromExternalApi(cedula: string, token: string) {
  const apiUrl = `https://api.hph.com.co/api/Bdatam/GetCreditsBDAtamById?Id=${cedula}`;
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al consultar la API de créditos: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [data];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cedula = searchParams.get("cedula");

  if (!cedula) {
    return NextResponse.json({ error: "Cédula no proporcionada" }, { status: 400 });
  }

  try {
    const token = await getAuthToken();
    const data = await fetchCreditosFromExternalApi(cedula, token);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}