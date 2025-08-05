/**
 * Utilitários para formatação de datas
 * Resolve problemas de fuso horário ao trabalhar com datas vindas do backend
 */

/**
 * Formata uma string de data (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
 * Evita problemas de fuso horário criando a data localmente
 * @param {string} dateString - String no formato YYYY-MM-DD 
 * @returns {string} Data formatada no padrão brasileiro ou string original em caso de erro
 */
export const formatDateToBR = (dateString) => {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month - 1 porque mês no JS é 0-indexado
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

/**
 * Cria um objeto Date local a partir de uma string YYYY-MM-DD
 * Evita problemas de fuso horário
 * @param {string} dateString - String no formato YYYY-MM-DD
 * @returns {Date|null} Objeto Date ou null em caso de erro
 */
export const createLocalDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  } catch {
    return null;
  }
};

/**
 * Compara duas datas no formato string YYYY-MM-DD
 * @param {string} dateA - Primeira data
 * @param {string} dateB - Segunda data
 * @returns {number} -1 se dateA < dateB, 0 se iguais, 1 se dateA > dateB
 */
export const compareDates = (dateA, dateB) => {
  const dateObjA = createLocalDate(dateA);
  const dateObjB = createLocalDate(dateB);
  
  if (!dateObjA || !dateObjB) return 0;
  
  if (dateObjA < dateObjB) return -1;
  if (dateObjA > dateObjB) return 1;
  return 0;
};

/**
 * Verifica se uma data já passou (é anterior à data atual)
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {boolean} True se a data já passou
 */
export const isDatePast = (dateString) => {
  const date = createLocalDate(dateString);
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
};

/**
 * Formata período de datas para exibição
 * @param {string} startDate - Data de início no formato YYYY-MM-DD
 * @param {string} endDate - Data de fim no formato YYYY-MM-DD
 * @returns {string} Período formatado
 */
export const formatDatePeriod = (startDate, endDate) => {
  if (!startDate || !endDate) return "Consulte o organizador";
  
  const formattedStart = formatDateToBR(startDate);
  const formattedEnd = formatDateToBR(endDate);
  
  return `${formattedStart} até ${formattedEnd}`;
};
