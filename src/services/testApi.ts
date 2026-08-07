import API_URL from "./api";

export async function testApi() {
  try {
    const response = await fetch(`${API_URL}/categories`);

    if (!response.ok) {
      throw new Error("No se pudo conectar con la API");
    }

    const data = await response.json();

    console.log("Respuesta de la API:", data);

    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}