export const formatDateToBR = (dateString) => {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

export const createLocalDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  } catch {
    return null;
  }
};

export const compareDates = (dateA, dateB) => {
  const dateObjA = createLocalDate(dateA);
  const dateObjB = createLocalDate(dateB);
  
  if (!dateObjA || !dateObjB) return 0;
  
  if (dateObjA < dateObjB) return -1;
  if (dateObjA > dateObjB) return 1;
  return 0;
};

export const isDatePast = (dateString) => {
  const date = createLocalDate(dateString);
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
};

export const formatDatePeriod = (startDate, endDate) => {
  if (!startDate || !endDate) return "Consulte o organizador";
  
  const formattedStart = formatDateToBR(startDate);
  const formattedEnd = formatDateToBR(endDate);
  
  return `${formattedStart} até ${formattedEnd}`;
};
