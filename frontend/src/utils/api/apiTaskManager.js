import api from "./Api";

async function getAllEvents() {
  try {
    const response = await api.get("/eventos/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error; 
  }
}

export default getAllEvents;