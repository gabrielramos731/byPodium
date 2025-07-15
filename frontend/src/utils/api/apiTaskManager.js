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

async function getUserInscriptions(){
  try{
    const response = await api.get("/inscricoes/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar inscrições do usuário:", error);
    throw error;
  }
}

async function getUserProfile(){
  try{
    const response = await api.get("/perfil/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw error;
  }
}

async function cancelEventInscription(eventId) {
  try {
    const response = await api.delete(`/eventos/${eventId}/criar`);
    
    if (response.status === 204 || response.status === 200) {
      return { success: true, message: 'Inscrição cancelada com sucesso' };
    }
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 204) {
      return { success: true, message: 'Inscrição cancelada com sucesso' };
    }
    
    if (error.response?.status === 500) {
      const customError = new Error('Status 500 - verificar se operação foi bem-sucedida');
      customError.response = error.response;
      customError.isStatus500 = true;
      throw customError;
    }
    
    throw error;
  }
}

export default getAllEvents;
export { getEventById };
export { getUserInscriptions };
export { getUserProfile };
export { cancelEventInscription };