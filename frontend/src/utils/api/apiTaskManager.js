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

// Função específica para verificar se o usuário é admin
async function getUserAuthProfile(){
  try{
    const response = await api.get("/auth/profile/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar perfil de autenticação:", error);
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

async function getEventRegistrationInfo(eventId) {
  try {
    const response = await api.get(`/eventos/${eventId}/criar`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar informações de inscrição:", error);
    throw error;
  }
}

async function createEventRegistration(eventId, registrationData) {
  try {
    const response = await api.post(`/eventos/${eventId}/criar`, registrationData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar inscrição:", error);
    throw error;
  }
}

async function loginUser(credentials) {
  try {
    const response = await api.post("/auth/login/", credentials);
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
}

async function registerUser(userData) {
  try {
    const response = await api.post("/auth/register/", userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
}

async function getEstados() {
  try {
    const response = await api.get("/auth/estados/");
    return response.data.estados; // Retornar apenas o array de estados
  } catch (error) {
    console.error("Erro ao buscar estados:", error);
    throw error;
  }
}

async function getCidades(estado = null) {
  try {
    const url = estado ? `/auth/cidades/?estado=${estado}` : "/auth/cidades/";
    const response = await api.get(url);
    return response.data.cidades; // Retornar apenas o array de cidades
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    throw error;
  }
}

// Funções para gerenciamento de eventos
async function createEvent(eventData) {
  try {
    // Se eventData é FormData, remover Content-Type para o navegador definir automaticamente
    const config = {};
    if (eventData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined
      };
    }
    
    const response = await api.post("/eventos/criar/", eventData, config);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
}

async function updateEvent(eventId, eventData) {
  try {
    // Se eventData é FormData, remover Content-Type para o navegador definir automaticamente
    const config = {};
    if (eventData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined
      };
    }
    
    const response = await api.patch(`/eventos/gerenciar/${eventId}/`, eventData, config);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    throw error;
  }
}

async function cancelEvent(eventId, justificativa) {
  try {
    await api.delete(`/eventos/gerenciar/${eventId}/`, {
      data: { justificativa }
    });
    return { success: true, message: 'Evento cancelado com sucesso' };
  } catch (error) {
    console.error("Erro ao cancelar evento:", error);
    throw error;
  }
}

async function getEventToManage(eventId) {
  try {
    const response = await api.get(`/eventos/gerenciar/${eventId}/`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do evento para gerenciar:", error);
    throw error;
  }
}

export default getAllEvents;
export { getEventById };
// Funções para administradores - eventos pendentes
async function getPendingEvents() {
  try {
    const response = await api.get("/eventos/pendentes/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar eventos pendentes:", error);
    throw error;
  }
}

async function updateEventStatus(eventId, status, confirmacao = false, feedback_admin = '') {
  try {
    const payload = { 
      status, 
      confirmacao 
    };
    
    // Adicionar feedback apenas para negações
    if (status === 'negado' && feedback_admin.trim()) {
      payload.feedback_admin = feedback_admin.trim();
    }
    
    const response = await api.patch(`/eventos/pendentes/${eventId}/`, payload);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status do evento:", error);
    throw error;
  }
}

export { getUserInscriptions };
export { getUserProfile };
export { getUserAuthProfile };
export { cancelEventInscription };
export { getEventRegistrationInfo };
export { createEventRegistration };
export { loginUser };
export { registerUser };
export { getEstados };
export { getCidades };
export { createEvent };
export { updateEvent };
export { getPendingEvents };
export { updateEventStatus };
export { cancelEvent };
export { getEventToManage };
export { getPaymentStatus };

// Funções de pagamento
async function getPaymentStatus(inscricaoId) {
  try {
    const response = await api.get(`/payment/status/${inscricaoId}/`);
    return response.data;
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error);
    throw error;
  }
}