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

async function getEventById(id) {
  try {
    const response = await api.get(`/eventos/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    throw error;
  }
}

export default getAllEvents;
export { getEventById };